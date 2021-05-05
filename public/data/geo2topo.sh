#!/bin/sh

# find ./geojson -type f | while read file
# find ./geojson -type f | while read file
dir=${HOME}/data/JapanCityGeoJson-master/geojson/prefectures
find ${dir} -type f | while read file
do
    arr=( `echo $file | tr -s '/' ' '`)
    # pref_code=${arr[2]}
    # ディレクトリ
    # dir="topojson/"$pref_code
    # if [ ! -d $dir ]; then
    #   mkdir -p $dir
    # fi
    basename=$(basename $file)

    if [[ $basename =~ [0-9]+\.json$ ]]; then
      name=( `echo $basename | sed -e "s/\.json/_topo.json/"`)
      geo2topo $dir/$basename > $name
    fi
done