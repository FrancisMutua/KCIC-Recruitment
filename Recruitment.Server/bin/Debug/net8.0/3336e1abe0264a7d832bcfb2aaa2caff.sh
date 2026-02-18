function list_child_processes () {
    local ppid=$1;
    local current_children=$(pgrep -P $ppid);
    local local_child;
    if [ $? -eq 0 ];
    then
        for current_child in $current_children
        do
          local_child=$current_child;
          list_child_processes $local_child;
          echo $local_child;
        done;
    else
      return 0;
    fi;
}

ps 24145;
while [ $? -eq 0 ];
do
  sleep 1;
  ps 24145 > /dev/null;
done;

for child in $(list_child_processes 24178);
do
  echo killing $child;
  kill -s KILL $child;
done;
rm /Users/simongideon/Documents/Appkings/PORTALS/BIOVAX-/BioVax/Recruitment/Recruitment.Server/bin/Debug/net8.0/3336e1abe0264a7d832bcfb2aaa2caff.sh;
