# TODO:
#  - files w/ parens
orig_dir=$(pwd)
rm $orig_dir/dh.out 2> /dev/null
rm $orig_dir/notfound.out
for d in $( echo '/google_drive/catholic/tedesche/uploads/daily_homilies/audio /google_drive/catholic/tedesche/uploads/Sunday_Homilies/audio' ); do
  cd $d
  for f in $(ls -1 * | grep '[SD]H' | grep -v '(' | head -n 100)
  do
    #echo " "
    #echo $f
    day_of_week=$(echo $f | grep 'Fri' | sed 's/.*Fri.*/Friday/g')
    if [ ! -z "$day_of_week" ]; then
      day_of_week_num=6
    fi
    if [ -z "$day_of_week" ]; then
      day_of_week=$(echo $f | grep 'Mon' | sed 's/.*Mon.*/Monday/g')
      day_of_week_num=2
    fi
    if [ -z "$day_of_week" ]; then
      day_of_week=$(echo $f | grep 'Tues' | sed 's/.*Tues.*/Tuesday/g')
      day_of_week_num=3
    fi
    if [ -z "$day_of_week" ]; then
      day_of_week=$(echo $f | grep 'Wed' | sed 's/.*Wed.*/Wednesday/g')
      day_of_week_num=4
    fi
    if [ -z "$day_of_week" ]; then
      day_of_week=$(echo $f | grep 'Thurs' | sed 's/.*Thurs.*/Thursday/g')
      day_of_week_num=5
    fi
    if [ -z "$day_of_week" ]; then
      day_of_week=$(echo $f | grep 'Sat' | sed 's/.*Sat.*/Saturday/g')
      day_of_week_num=7
    fi
    if [ -z "$day_of_week" ]; then
      day_of_week=$(echo $f | grep 'Sun' | sed 's/.*Sun.*/Sunday/g')
      day_of_week_num=1
    fi

    if [ ! -z "$day_of_week" ]
    then
      week_num=$(echo $f | grep '[SD]H[0-9]' | sed 's/.*[SD]H0\?\([0-9]*\).*/\1/g')
      if [[ $week_num =~ ^-?[0-9]+$ ]]; then
        week_num2=$week_num
        week_num=$(echo $week_num | sed 's/30/30th/g')
        week_num=$(echo $week_num | sed 's/20/20th/g')
        week_num=$(echo $week_num | sed 's/10/10th/g')
        week_num=$(echo $week_num | sed 's/11/11th/g')
        week_num=$(echo $week_num | sed 's/12/12th/g')
        week_num=$(echo $week_num | sed 's/13/13th/g')
        week_num=$(echo $week_num | sed 's/^\([0-9]\?1\)$/\1st/g')
        week_num=$(echo $week_num | sed 's/^\([0-9]\?2\)$/\1nd/g')
        week_num=$(echo $week_num | sed 's/^\([0-9]\?3\)$/\1rd/g')
        week_num=$(echo $week_num | sed 's/^\([0-9]\?[456789]\)$/\1th/g')
        #if [[ $week_num -eq 1 ]]; then
        #week_num="${week_num}st"
      fi
      if [ ! -z "$week_num" ]; then
        season=$(echo $f | grep 'Ord' | sed 's/.*/Ordinary Time/g')
        if [ -z "$season" ]; then
          season=$(echo $f | grep 'Lent' | sed 's/.*/Lent/g')
        fi 
        if [ ! -z "$season" ]; then
          echo "found: $f,$day_of_week_num,$week_num2,$season,$day_of_week of the $week_num Week in $season"
          echo "$season,$week_num2,$day_of_week_num,$(pwd),$f,$day_of_week of the $week_num Week in $season" >> $orig_dir/dh.out
        else
          echo "not found 1: $f" >> $orig_dir/notfound.out
        fi
      else
        echo "not found 2: $f" >> $orig_dir/notfound.out
      fi
    else
      echo "not found 3: $f" >> $orig_dir/notfound.out
    fi
  done
done

cd $orig_dir

rm cal.out 2> /dev/null
rm cal.csv 2> /dev/null
for year in $(echo '2015 2016'); do
  for season in $(echo 'Lent Ordinary Advent'); do
    cat dh.out | grep $year | grep $season | sort -t , -k2 -k3 -n >> cal.csv
  done
done

