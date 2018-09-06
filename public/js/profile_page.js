//hides comparison table when page loads (will be shown when a file is selected)
$(document).ready(function(){
	$('docComparison').hide();
});

//goes to the page of the address, can be used on buttons
function GoToPage(address)
{
	location.href = address;
}

//toggles a div on and off, used to hide/show sections
function ToggleElement(divId)
{
	var x = document.getElementById(divId);
	if(x.style.display === "none"){
		x.style.display = "block";
	}else{
		x.style.display = "none";
	}
}

function ToggleTables()
{
	ToggleElement("docComparison");
	ToggleElement("searchTable");
}

//will be used to display files for comparison (not finished)
function LoadFile(percent)
{
	ToggleTables();
	showSimilarity(percent);
	//AddTextToElement(id, txt);
}

function AddTextToElement(id, txt)
{
	document.getElementById(id).innerHTML = txt;
}

//used to display similarity in the appropriate colour
function showSimilarity(percent)
{
	var similarityText = document.getElementById('similarity');
	similarityText.innerHTML = "Similarity " + percent;
	if(percent <= 20){
		//green
		similarityText.style.backgroundColor = "#9bff8e";
	}else if(percent < 50){
		//yellow
		similarityText.style.backgroundColor = "yellow";
	}else{
		//red
		similarityText.style.backgroundColor = "red";
	}
}