var filterIndexName = function(str) {
  return str.replace(/[^a-zA-Z]/g,"");
}

var deleteIndex = function(indexName) {
  var req = {
    method: "delete",
    url: "/api/" + encodeURIComponent(indexName),
    dataType: "json"
  };
  $.ajax(req).done(function(data) {
    console.log(data);
    getList()
  });
};

function generateForm(indexName) {
  var html = ' <input id="' + indexName + '">';
  return html;
}

function generateDelete(indexName) {
  var html = '<a class="btn btn-danger" href="Javascript:deleteIndex(\''  +  indexName + '\')" role="button">Delete</a>'
  return html;
}

function generateTable(data) {
  if (data && data.length>0) {
    var html = "";
    html += '<table class="table table-striped">\n';
    html += '<thead>';
    html += '<tr><th>Index</th><th>Test</th><th>API URL</th><th>Delete</th></tr>\n';
    html += '</thead>\n';
    html += '<tbody>\n';
    for (var i in data) {
      html += '<tr><td>' + data[i] + '</td><td>' + generateForm(data[i]) + '</td>';
      html += '<td>/api/' + data[i] + '?term=a</td>\n';
      html +='<td>' + generateDelete(data[i]) + '</td></tr>\n';
    }
    html += '</tbody></table>\n';
  } else {
    html = '<div class="alert alert-warning">You have no autocomplete indexes defined.</div>'; 
  }

  return html;
}

function getList() {
  var req = {
    method: "get",
    url: "/api",
    dataType: "json"
  };
  $.ajax(req).done(function(data) {
    $('#thetable').html(generateTable(data));
    for(var i in data) {
      $( "#" + data[i] ).autocomplete({
        source: "/api/" + encodeURIComponent(data[i]),
        minLength: 1,
        delay:0
      });
    }
    console.log(data);
  });
}

$(function() {
  getList();

  $('#uploadform').submit( function(e) {
      e.preventDefault();
      $('#submitbutton').prop("disabled", true)
      var data = new FormData(this); 
      console.log(data);
      var name = filterIndexName($('#name').val());
      if (!name || name.length==0) {
        alert("You must supply an index name");
        $('#submitbutton').prop("disabled", false);
        return false;
      }
      var req  = {
        url: '/api/' + encodeURIComponent(name),
        data: data,
        cache: false,
        contentType: false,
        processData: false,
        type: 'POST',     
        success: function(data){ 
          getList()
        }
      };
      $.ajax(req).done(function() {
        $('#submitbutton').prop("disabled", false);
      });
  });                 
});