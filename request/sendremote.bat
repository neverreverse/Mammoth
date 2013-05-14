@echo off
set URL=http://42.121.104.250:3000/%1%
echo The follow command will be send to %URL% %1
echo send content is :
echo --begin of content--
type %1 
echo --end of content--
wget %URL% --header=Content-Type:application/json --post-file %1