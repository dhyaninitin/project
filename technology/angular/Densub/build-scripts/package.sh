set -e

if [ -z $3 ]; then
  echo "Usage: bash $(basename $0) <sourceDir> <archiveName> <archiveDir> <archiveName"
  exit 1
fi

sourceDir="$1"
archiveName="$2"
baseArchiveDir="$3"
archiveDir=$(realpath "$baseArchiveDir")

mkdir -p "$archiveDir"
cd "$sourceDir"
zip -r "$archiveDir/$archiveName" *
