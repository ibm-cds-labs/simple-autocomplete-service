var filter = function(str) {
  return str.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
}

module.exports = {
  filter: filter
}