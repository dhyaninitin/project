var gunzip = require('gunzip-file');
gunzip('full_file_for_carblip_20180326.tsv.gz', 'full_file_for_carblip_20180326.tsv', function() {
    console.log('This is called when the extraction is completed.');
});