
function deleteUser(usrname) {
    if (usrname) {
        $.ajax({
            url: '/User/deleteUser/' + usrname,
            contentType: "application/json",
            type: 'POST',
            async: true,
            statusCode: {
                403: function (response) {
                    alert(response);
                },
                200: function (response) {
                    alert(response);
                    window.location.reload(true);
                }
            },
            error: function (jqXHR, status, errorThrown) {
                alert('error');
            }
        });
    } else {
        alert("UserName is blank?.");
    }
}

function setUserType(usrname, type) {
    if (usrname && type) {
        $.ajax({
            url: '/Admin/Promote/' + usrname + "&" + type,
            contentType: "application/json",
            type: 'POST',
            async: true,
            statusCode: {
                500: function (response) {
                    alert(response);
                },
                200: function (response) {
                    alert(response);
                    window.location.reload(true);
                }
            },
            error: function (jqXHR, status, errorThrown) {
                alert('error');
            }
        });
    } else {
        alert("UserName and or type is empty?.");
    }
}