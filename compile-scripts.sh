# !/bin/bash

########################################################################
# Compiles the typescript to a nicely bundled and minified
# javascript file in the dist folder
########################################################################

for FILE in src/*.ts; do
  file_to_compile=$FILE
  file=${file_to_compile##*/}
  # Filename without extension
  filename="${file%.*}"

  echo "#######################################################"
  echo "File to Compile: ${file_to_compile}"
  echo "File: ${file}"
  echo "Filename: ${filename}"
  echo "#######################################################"

  ncc build "${file_to_compile}" -m

  echo "Renaming dist/index.js to dist/${filename}.js\n"
  mv "dist/index.js" "dist/${filename}.js"
done