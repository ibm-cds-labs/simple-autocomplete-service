var filter = function(str) {
  if (!str) {
    return "";
  }
  return str.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
}

module.exports = {
  filter: filter
}