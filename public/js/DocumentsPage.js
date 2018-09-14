/* Shamelessly using Shane's code because i'm a lazy. */

let document_filename;
let document_contents;

//hides comparison table when page loads (will be shown when a file is selected)
$(document).ready(function(){
    $('docComparison').hide();
});

//goes to the page of the address, can be used on buttons
function GoToPage(address) {
    location.href = address;
}

//toggles a div on and off, used to hide/show sections
function ToggleElement(divId) {
    let x = document.getElementById(divId);
    if(x.style.display === "none"){
        x.style.display = "block";
    }else{
        x.style.display = "none";
    }
}

function ToggleTables() {
    ToggleElement("docTable");
    ToggleElement("docEditor");
}

function saveContents() {
    if (document_filename) {
        $.ajax({
            url: '/documents/content/' + document_filename,
            contentType: "application/json",
            type: 'PUT',
            data: JSON.stringify({data: $("#documentContent").val()}),
            async: true,
            statusCode: {
                404: function (response) {
                    alert("Failed save contents for file " + fname);
                },
                200: function (response) {
                    alert("saved: " + document_filename);
                }
            },
            error: function (jqXHR, status, errorThrown) {
                alert('error');
            }
        });
    } else {
        alert("no document has been loaded, therefore no save.");
    }
}

//will be used to display files for comparison (not finished)
function LoadFile(fname) {
    document_filename = null;
    $.ajax({
        url: '/documents/content/' + fname,
        dataType: 'text',
        type: 'GET',
        async: true,
        statusCode: {
            404: function (response) {
                alert("Failed to retrieve contents for file " + fname);
            },
            200: function (response) {
                document_contents = response;
                document_filename = fname;
                $("#documentContent").val(document_contents);
                ToggleTables();
            }
        },
        error: function (jqXHR, status, errorThrown) {
            alert('error');
        }
    });
}