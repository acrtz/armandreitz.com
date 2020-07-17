#=====================================================================
#!/bin/bash
# 
# removes .html file extension from all files except index.html
# so that '.html' extension isn't required in url
# 
# Usage: (assumes aws cli is set up with access key and secret key)
#   ./deploy.sh <ACCESS_KEY> <SECRET_KEY>
#=====================================================================

# Set bucket value for s3 sync
export BUCKET="armandreitz.com"
# name for a temporary directory 
export TEMP_DIR=".jekyll-temp"

# Build jekyll
jekyll build

# Copy the _site contents to newly create temp dir.
#(This step is done in case the dev server is still running)
mkdir -p $TEMP_DIR
cp -r _site/. $TEMP_DIR

# Remove the .html extension from all files in root except index.html
for path in $TEMP_DIR/*.html; do
  if [ $path != "$TEMP_DIR/index.html" ] && [ $path != "$TEMP_DIR/404.html" ];
    then
        original="$path"

        # Get the filename without the path/extension
        filename=$(basename "$path")
        # Find extension by removing everything before last '.'
        # extension="${filename##*.}"
        # Find filename by removing everything 
        filename="${filename%.*}"

        # Move it
        mv $original $TEMP_DIR/$filename
    fi
done

# Remove the .html extension from all posts posts for sexy URLs
for filename in $TEMP_DIR/post/*.html; do
  original="$filename"

  # Get the filename without the path/extension
  filename=$(basename "$filename")
  # extension="${filename##*.}"
  filename="${filename%.*}"

  # Move it
  mv $original $TEMP_DIR/post/$filename
done

# Remove the .html extension from all projects posts for sexy URLs
for filename in $TEMP_DIR/project/*.html; do
  original="$filename"

  # Get the filename without the path/extension
  filename=$(basename "$filename")
  # extension="${filename##*.}"
  filename="${filename%.*}"

  # Move it
  mv $original $TEMP_DIR/project/$filename
done

# Now upload to s3, deleting any items that no longer exist
aws s3 sync --delete $TEMP_DIR s3://$BUCKET

# Finally, upload the blog directory specifically to force the content-type
aws s3 cp "$TEMP_DIR/blog" s3://$BUCKET/blog --content-type "text/html"
aws s3 cp "$TEMP_DIR/projects" s3://$BUCKET/projects --content-type "text/html"
aws s3 cp "$TEMP_DIR/about" s3://$BUCKET/about --content-type "text/html"
aws s3 cp "$TEMP_DIR/post" s3://$BUCKET/post --recursive --content-type "text/html"
aws s3 cp "$TEMP_DIR/project" s3://$BUCKET/project --recursive --content-type "text/html"

# Cleanup
rm -r $TEMP_DIR