while [ true ]
do
#sudo service ntp stop
#sudo ntpdate ntp.ubuntu.com
date;

  cp -uR ./orig.google_drive/* ./orig
  # pull down latest from tedesche
  # this works - ignore the "skipping over directories" message.  At one point the file name was too long.  nope that wasn't it either - it was the uppercase MP3
  #s3cmd sync -r s3://tedesche/  ./orig/
  #date;

  # run groovy
  #ant groovy; 
  date;

  # push latest to www.catholicpatrimony.com
  s3cmd sync -P --skip-existing --guess-mime-type ./build/daily_homilies/* s3://www.catholicpatrimony.com/daily_homilies/
  s3cmd sync -P --skip-existing --guess-mime-type ./build/Sunday_Homilies/* s3://www.catholicpatrimony.com/Sunday_Homilies/
  #s3cmd --no-check-md5 --skip-existing --exclude *zip --recursive get s3://www.catholicpatrimony.com /tedesche/build
  #s3cmd -P --skip-existing --guess-mime-type sync build/ s3://www.catholicpatrimony.com/
  #s3cmd -P --no-check-md5 --skip-existing --recursive sync build/* s3://www.catholicpatrimony.com/
  #s3cmd sync -P s3://www.catholicpatrimony.com/ ./build
  #s3cmd -P --no-check-md5 --recursive sync build/uncovering_2015/podcast.xml s3://www.catholicpatrimony.com/uncovering_2015/
  s3cmd -P --no-check-md5 sync build/daily_homilies/podcast.xml s3://www.catholicpatrimony.com/daily_homilies/
  s3cmd -P --no-check-md5 sync build/Sunday_Homilies/podcast.xml s3://www.catholicpatrimony.com/Sunday_Homilies/
  date;

  #s3cmd sync --add-header=Cache-Control:no-cache -P --guess-mime-type ../web/web/cp.json s3://www.catholicpatrimony.com/web/
  s3cmd sync --add-header=Cache-Control:no-cache -P --guess-mime-type ../web/index.html s3://www.catholicpatrimony.com/
  s3cmd sync -P --guess-mime-type ../web/ s3://www.catholicpatrimony.com/
  s3cmd sync --add-header=Cache-Control:no-cache -P --guess-mime-type ../web/index.html s3://www.catholicpatrimony.com/
  date;

  sleep 1200;
done
