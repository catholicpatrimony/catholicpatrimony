while [ true ]
do
#sudo service ntp stop
sudo ntpdate ntp.ubuntu.com
date;

  # pull down latest from tedesche
  # this works - ignore the "skipping over directories" message.  At one point the file name was too long.  nope that wasn't it either - it was the uppercase MP3
  s3cmd sync -r s3://tedesche/  ./orig/
  date;

  # run groovy
  ant groovy; 
  date;

  # push latest to www.catholicpatrimony.com
  s3cmd sync -P --guess-mime-type ./build/ s3://www.catholicpatrimony.com/
  date;

  s3cmd sync --add-header=Cache-Control:no-cache -P --guess-mime-type ../web/web/cp.json s3://www.catholicpatrimony.com/web/
  date;

  sleep 1200;
done
