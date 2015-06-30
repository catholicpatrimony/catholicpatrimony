import groovyx.net.http.*; import static groovyx.net.http.ContentType.*;
import static groovyx.net.http.Method.*;
import au.com.bytecode.opencsv.CSVParser;
import org.apache.commons.io.FileUtils;
import org.apache.velocity.app.Velocity;
import org.apache.velocity.Template;
import org.apache.velocity.context.Context;
import org.apache.velocity.VelocityContext;

import org.apache.commons.lang.StringUtils;
import com.fasterxml.jackson.databind.ObjectMapper;
import groovy.json.*;

/*
s3cmd sync -r s3://tedesche/  ./orig/
date;

# run groovy
ant groovy; 
date;

# push latest to www.catholicpatrimony.com
s3cmd sync -P --guess-mime-type ./build/ s3://www.catholicpatrimony.com/
date;

s3cmd sync -P --guess-mime-type ../web/web/cp.json s3://www.catholicpatrimony.com/web/
date;
*/
def ops = []
ops.add("print");
ops.add("audio");
//ops.add("zip");
ops.add("docs");
ops.add("json");
//ops.add("wp");
ops.add("podcast");

def mockRun = false;

def http = new HTTPBuilder( 'https://docs.google.com')

def objectMapper = new ObjectMapper(); 

/*
Date d2 = Date.parse("MM/dd/yyyy", '11/17/2012')
println d2.format("EEE, d MMM yyyy HH:mm:ss Z");
d2 = Date.parse("MM/dd/yyyy", '1/1/2012')
println d2.format("EEE, d MMM yyyy HH:mm:ss Z");
System.exit(1);
*/

/*
https://docs.google.com/spreadsheet/pub?key=0AkWmZX8HtwWHdENUNFcxdG9XdzBTaWhlVkZ0RU1QcXc&output=csv&single=true&gid=0
https://docs.google.com/spreadsheet/pub?key=0AkWmZX8HtwWHdENUNFcxdG9XdzBTaWhlVkZ0RU1QcXc&output=csv&single=true&gid=1
*/


def jsonClassArr = []
//for (gid in 5) {
for (gid in 0..6) {
  println 'gid: '+gid;
  def responseStr = null;

  // perform a GET request, expecting JSON response data
  http.request( GET, TEXT ) {
    uri.path = '/spreadsheet/pub'
    uri.query = [ key:'0AkWmZX8HtwWHdENUNFcxdG9XdzBTaWhlVkZ0RU1QcXc', output: 'csv', single: true, gid: gid ]

    headers.'User-Agent' = 'Mozilla/5.0 Ubuntu/8.10 Firefox/3.0.4'

    response.success = { resp, reader ->
      assert resp.status == 200
      println "My response handler got response: ${resp.statusLine}"
      println "Response length: ${resp.headers.'Content-Length'}"
      responseStr = reader.getText() // print response reader
      println responseStr
    }
   
    // called only for a 404 (not found) status code:
    response.'404' = { resp ->
      println 'Not found'
    }

  }
  seriesLabels = [];
  seriesData = [:];
  classLabels = [];
  classes = [];
  CSVParser csvp = new CSVParser();
  responseStr.eachLine { line, lineNumber ->
    String[] cols = csvp.parseLine(line); 
    cols.eachWithIndex{ p, i -> 
      if (StringUtils.isEmpty(p)) {
        return false; 
      }
      if (lineNumber == 0) {
        seriesLabels[i] = p;
      } else if (lineNumber == 1) {
          seriesData.put(seriesLabels[i], p); 
      } else if (lineNumber == 2) {
        classLabels[i] = p;
      } else if (lineNumber >= 3) {
        if (classLabels[i].equals('id') && p.length() == 1) {
          p = '0'+p;
        }
        def row = classes[lineNumber - 3]
        if (row == null) {
          row = [:]
          classes.add(row);
        }
        def existingValue = row.get(classLabels[i]);
        if (existingValue != null) {
          if (existingValue instanceof java.util.List) {
            existingValue.add(p);
          } else {
            row.put(classLabels[i], [existingValue, p]);
          }
        } else {
          row.put(classLabels[i], p); 
        }
        if (classLabels[i].equals('date')) {
          Date d = Date.parse("MM/dd/yyyy", p)
          row.put('rssDate', d.format("EEE, d MMM yyyy HH:mm:ss Z"));
        }
        if (classLabels[i].equals('updated_on')) {
          Date d = Date.parse("MM/dd/yyyy HH:mm:ss", p)
          row.put('updated_on_date', d);
        }
      }
    };
  }

  def format = 'wp';
  "mkdir -p ./build/web/${seriesData.normalized_name}".execute().waitFor();
  "mkdir -p ./build/${seriesData.normalized_name}".execute().waitFor();

  for (c in classes) {
    if (c.audio) {
      c['newAudio'] = c.id +"-${seriesData.normalized_name}.mp3"
    }
    if (c.handout_file) {
      if (c.handout_file instanceof Collection) {
        c.new_handout_file = [];
        c.new_handout_title = [];
        for (def i=0; i<c.handout_file.size; i++) {
          c.new_handout_file[i] = getNewHandoutFileName(c.id, c.handout_title[i], c.handout_file[i]);
          c.new_handout_title[i] = c.handout_title[i]
        }
      } else {
        c.new_handout_file = [];
        c.new_handout_title = [c.handout_title];
        c.new_handout_file[0] = getNewHandoutFileName(c.id, c.handout_title, c.handout_file);
        c.handout_file = [c.handout_file];
        c.handout_title = [c.handout_title];
      }
    }
  }

  if ("TRUE".equals(seriesData["reverse_order"])) {
    classes = classes.reverse();
  }

  if (ops.contains('wp')) {
    runVelocity(
      "velocity/${format}.vm", 
      "build/web/${seriesData.normalized_name}/${format}.php",
      ["seriesData": seriesData, "classLabels": classLabels, "classes": classes]
    );
  }

  if (ops.contains('json')) {
    def jsonMap = [classes: classes, seriesData: seriesData]
    jsonClassArr.add(jsonMap);
  }

  if (ops.contains('print')) {
    println classLabels;
    println classes;
  }

  if (ops.contains('audio')) {
    /*
    "rm -fR ./build/${seriesData.normalized_name}/audio".execute().waitFor();
    */
    try {
      "mkdir -p ./build/${seriesData.normalized_name}/audio".execute().waitFor();
    } catch (t) {
      //do nothing
    }
    if (!new File("orig/${seriesData.normalized_name}").exists()) {
      def proc = "s3cmd sync s3://tedesche/${seriesData.normalized_name} ./orig".execute();
      proc.waitFor();
    }
    for (c in classes) {
      //if (!new File("build/${seriesData.normalized_name}/audio/${c.newAudio}").exists()) {
      if (true) {
        if (c.audio) {

          def origFileStr = "orig/${seriesData.normalized_name}/audio/${c.audio}"
          def newFileStr = "build/${seriesData.normalized_name}/audio/${c.newAudio}"

          def createAudio = fileNewerThan(origFileStr, newFileStr, c.updated_on_date);

          println ("c.audio: ${c.audio}");
          println ("createAudio: ${createAudio}");
          if (c.volume_boost == null) {
            c.volume_boost = "1";
          }
          println ("c.volume_boost: ${c.volume_boost}");

          if (createAudio) {
            if (!mockRun) {
              proc(["sox", "-v", c.volume_boost, origFileStr, "-r", "24k", "-c", "1", newFileStr]);
              proc(["id3v2", "-a", "David Tedesche", "-A", seriesData.normalized_name, "-t", c.title, "-T", c.id, newFileStr]);
            }
          }
        }
      }
    }
  }

  if (ops.contains('podcast')) {
    if (!mockRun) {
      if (fileNewerThanAll("build/${seriesData.normalized_name}/audio",
            "build/${seriesData.normalized_name}/podcast.xml" )) {
        for (c in classes) {
          if (c.audio) {
            def newFile = "build/${seriesData.normalized_name}/audio/${c.newAudio}"
            def outStr = proc("soxi ${newFile}");
            def matcher = outStr =~ /Duration *: (.*) =/
            c["duration"] = matcher[0][1];
            c["length"] = proc("ls -lad ${newFile}").split(" ")[4]
            c["link2mp3"] = "/${seriesData.normalized_name}/audio/${c.newAudio}"
          }
        }
        "mkdir -p ../web/${seriesData.normalized_name}".execute().waitFor();
        runVelocity(
          "velocity/podcast.vm", 
          "build/${seriesData.normalized_name}/podcast.xml",
          ["seriesData": seriesData, "classLabels": classLabels, "classes": classes]
        );
      }
    }
  }

  if (ops.contains('docs') || ops.contains('zip')) {
    if (!mockRun) {
      "mkdir -p ./build/${seriesData.normalized_name}/docs".execute().waitFor();
      for (c in classes) {
        if (c.handout_file) {
          c.handout_links = [];
          for (def i=0; i<c.handout_file.size; i++) {
            def oldFile = c.handout_file[i].replaceAll('%20', ' ');
            if (oldFile.indexOf('http') == -1) {
              def hf = "./orig/${seriesData.normalized_name}/docs/${oldFile}"
              def nhf = "./build/${seriesData.normalized_name}/docs/${c.new_handout_file[i]}"
              c.handout_links[i] = "/${seriesData.normalized_name}/docs/${c.new_handout_file[i]}";
              if (fileNewerThan(hf, nhf, c.updated_on_date)) {
                proc(["cp", hf, nhf])
              }
            } else {
              c.handout_links[i] = c.handout_file[i];
            }
          }
        }
      }
    }
  }

  if (ops.contains('zip')) {
    if (seriesData["include_zips"] == null || !seriesData["include_zips"]) {
      for (zipDirStr in [ "docs", "audio" ] ) {
        def zipFolderStr = "./build/${seriesData.normalized_name}/${zipDirStr}";
        def zipFileStr = "./build/${seriesData.normalized_name}/${seriesData.normalized_name}-${zipDirStr}.zip" 
        if (fileNewerThanAll(zipFolderStr, zipFileStr)) {
          println "needToZip: ${zipFolderStr}"
          if (!mockRun) {
            proc("zip -rj ${zipFileStr} "+
              "./build/${seriesData.normalized_name}/${zipFolderStr}")
          }
        }
      }
    }
  }

  if (ops.contains('s3-publish')) {
    // put audio back to s3
    // put zips up
    // make files public
  }

}
def jsonStr = new JsonBuilder( jsonClassArr ).toPrettyString()
jsonStr = "cp = " + jsonStr;
//new File("build/web/cp.json").withWriter { out -> out.write(jsonStr) };
new File("../web/web/cp.json").withWriter { out -> out.write(jsonStr) };

def String proc(def cmd) {
  println cmd;
  def proc = cmd.execute();
  proc.waitFor();
  println "return code: ${proc.exitValue()}"
  println "stderr: ${proc.err.text}"
  String outStr = proc.in.text
  println "stdout: ${outStr}"
  return outStr
}

def getNewHandoutFileName(id, ht, hf) {
  if (hf.indexOf('http') == -1) {
    def m = hf =~ /\.(.*)/
    def ext = m[0][1];
    println "ht: ${ht}"
    ht = ht.replaceAll(' ', '_');
    println "${id}-${ht}.${ext}"
    return "${id}-${ht}.${ext}"
  } else {
    return hf;
  }
}

def runVelocity(def templateFile, def outputFile, def data) {
  def writer = new BufferedWriter(new FileWriter(outputFile))
  Template template = Velocity.getTemplate(templateFile);
  def context = new VelocityContext();
  for (e in data) {
    println "${e.key}: ${e.value}"
    context.put(e.key, e.value);
    
  }
  template.merge(context, writer);
  writer.close();
}

def fileNewerThan(def origFileStr, def newFileStr, def updatedDate) {
  def needToGen = true;

  def newFile = new File(newFileStr);
  def origFile = new File(origFileStr);
  if ((updatedDate == null || updatedDate.toCalendar().getTimeInMillis() < newFile.lastModified()) && newFile.exists() && newFile.lastModified() > origFile.lastModified()) {
    needToGen = false  
  }

  return needToGen;
}

def fileNewerThanAll(def folder2zipStr, def zipStr) {
  def retVal = true;
  def zipFile = new File(zipStr);

  if (zipFile.exists()) {
    retVal = false;
    def mostRecentMod = 0;
    for (f in FileUtils.listFiles(new File(folder2zipStr), null, true)) {
      if (f.lastModified() > mostRecentMod) {
        mostRecentMod = f.lastModified();
      }
    }
    if (mostRecentMod > zipFile.lastModified()) {
      retVal = true;
    }
  }

  return retVal;
}
