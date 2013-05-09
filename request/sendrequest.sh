#!/bin/sh
URL="http://127.0.0.1:3000/$1"
echo "The follow command will be send to $URL" $1
echo "send content is :\n";
cat $1 ;
echo "\n--end of content--\n";
wget $URL --header=Content-Type:application/json --post-file $1