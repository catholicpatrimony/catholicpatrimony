while [ true ]
do
  #sudo service ntp stop
  sudo ntpdate ntp.ubuntu.com
  date;

  # this is not preserving the timestamp
  #cp -puR /google_drive/catholic/tedesche/uploads/* ./orig
  rsync -rt /google_drive/catholic/tedesche/uploads/daily_homilies ./orig
  rsync -rt /google_drive/catholic/tedesche/uploads/Sunday_Homilies ./orig
  rsync -rt /google_drive/catholic/tedesche/uploads/wednesday_night_talks ./orig
  rsync -rt /google_drive/catholic/tedesche/uploads/adult_education ./orig

  # run groovy
  ant groovy; 
  date;

  # push latest to www.catholicpatrimony.com

  s3cmd -P sync build/daily_homilies/ s3://www.catholicpatrimony.com/daily_homilies/
  s3cmd -P sync build/Sunday_Homilies/ s3://www.catholicpatrimony.com/Sunday_Homilies/
  s3cmd -P sync build/wednesday_night_talks/ s3://www.catholicpatrimony.com/wednesday_night_talks/
  s3cmd -P sync build/adult_education/ s3://www.catholicpatrimony.com/adult_education/
  date;

  s3cmd sync --add-header=Cache-Control:no-cache -P --guess-mime-type ../web/cp.json s3://www.catholicpatrimony.com/
  date;

  sleep 1200;
done

# when you change web stuff
#find ../web/ -name \*.js -o -name \*.html | xargs sed -i 's/cbp=......../cbp=20160704b/g'
#s3cmd -P sync ../web/ s3://www.catholicpatrimony.com/
