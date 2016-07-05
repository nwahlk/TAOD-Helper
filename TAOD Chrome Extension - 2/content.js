//input test case path, now support two kinds
//1. directly copy form P4 path
//such as //BUSMB_B1/TestAutomation_B1/9.1_DEV/9.1/New Developments/ToT_Bingo/
// BEB-16798_Factor and Base Pricelist on Item Line/
// Part1_Uncheck Remove unpriced items/Part1_Uncheck Remove unpriced items.xrt
//2. copy from TAOD test result form
// 9.1/New Developments/ToT_Nirvana/1184_Email Enhancement_UI/
// 1184_PrintSequence_DE/1184_PrintSequence_DE.xrt

//Notice: change below group name by your ToT	
var sql_vm = "SQL_DragonBoat";
var hana_vm = "HANA_Dragonboat";
var hana_server = "Dragonboat";

var default_testcase_path = "//BUSMB_B1/TestAutomation_B1/9.1_DEV/9.1/Ongoing Developments/"
							+"ToT_Nirvana/CreateCompany_US/CreateCompany_US.xrt"
		
		
function input_testcasePath(testcase_path_p4){
    var testcase_path = prompt("Please enter your test case path in P4",
                        testcase_path_p4);
    if(testcase_path != null){
        return testcase_path;
    }
}

//handle input test case path, split by "/", delete first 5 items if directly use
// p4 path
function get_testcasePath(testcase_path_p4){
    var testcase_path = input_testcasePath(testcase_path_p4);
    var res = testcase_path.split("/");
    if(!res[0]){
        res.splice(0,5);
    }
    return res;
}

// find the matching dom entry and expand it
function findAndExpandNext(testcase_path,matchString){
    $(testcase_path).children("ul").children("li").each(function(){
        if($(this).children("span").children("a.dynatree-title").html()
            == matchString){
            if($(this).children("span").children("span.dynatree-expander")){
                    $(this).children("span").children("span.dynatree-expander")
                            .click();
                }

            if(!$(this).children("ul").children("li").children("span").hasClass("dynatree-selected")
				&&$(this).children("ul").children("li").children("span")
                    .children("a.dynatree-title").html().indexOf("xrt") != -1){
                    $(this).children("span").children("span.dynatree-checkbox")
                        .click();
                }
            return testcase_path;
        }
    });
}

function setCheckbox(entry){
	if($(entry).attr("aria-checked") == "false"){
		$(entry).click();
	}
}

function waitForP4TreeAndSelectCase(selector, time) {
        if(document.querySelector(selector)!=null) {
            //alert("The element is displayed, you can put your code instead of this alert.")
			//step3: click scope and check test cases
			var testcase_path = get_testcasePath(default_testcase_path);
			//console.log(testcase_path);
			var root_path = "div#p4Tree ul li";
			for(var path_str in testcase_path){
				if(testcase_path[path_str].indexOf(".xrt") == -1){
					findAndExpandNext(root_path,testcase_path[path_str]);
					root_path += " ul li";
				}
			};
            return;
        }
        else {
            setTimeout(function() {
                waitForP4TreeAndSelectCase(selector, time);
            }, time);
        }
}
	
function set91()
{
	//Book this vm
	//$("input#txtBookNo").attr("value","1");
	//document.getElementById("txtBookNo").setAttribute("value","1");
	//Environment
	setCheckbox("div[title='Win7_NoBaseBuild']");
	//Machine Group:set owner's vm
	setCheckbox("div[title= "+ sql_vm + "]");
	//Click customize test case window
	if(!document.getElementById("p4Tree")){
		$("div.sap-ui-dropdownicon").click();
		$("div#ddlScope-guilin-dropdownlist li.sap-ui-dropdownlist-item").click();
	}
	
	//Select test cases
	waitForP4TreeAndSelectCase("a.dynatree-title",100);
	
	//Open install build window
	if(!document.getElementById("installPathFileTree")){
		//Click install path
		$("input#btnInstallPath").click();
	}
}

function set91hana()
{
	//For Hana
	setCheckbox("div#chkForHANA");
	$("div#ddlHANARevision div.sap-ui-dropdownicon").click();
	$("div#ddlHANARevision-guilin-dropdownlist ul li:last-child" ).click();
	//Book Hana machine
	//$("input#txtBookHANANo").val('1');
	//Hana Group:set owner's hana server
	setCheckbox("div[title= "+ hana_server + "]");
	//Machine Group:set owner's hana vm
	setCheckbox("div[title= "+ hana_vm + "]");
	
	//Book this vm
	//$("input#txtBookNo").val('1');
	//Environment
	setCheckbox("div[title='Win7_NoBaseBuild']");
	//Click customize test case window
	if(!document.getElementById("p4Tree")){
		$("div.sap-ui-dropdownicon").click();
		$("div#ddlScope-guilin-dropdownlist li.sap-ui-dropdownlist-item").click();
	}
	
	//Select test cases
	waitForP4TreeAndSelectCase("a.dynatree-title",100);

	//Open install build window
	if(!document.getElementById("installPathFileTree")){
		//Click install path
		$("input#btnInstallPath").click();
	}
}

function set92()
{
	//Check install new build
	setCheckbox("div[title='Install new base build (Mandatory for 9.2)']");
	set91();
}


function set92hana()
{
	//Check install new build
	setCheckbox("div[title='Install new base build (Mandatory for 9.2)']");
	//Click ServerTools path
	$("input#btnServerToolsPath").click();	
	set91hana();
}

//Main function
function autoCheckTestCase(){
	//step1: click create button;
	$("div.tools input[value = 'Create']").click();
	//step2: Get project id and check some checkboxes
	var project = $("div#ddlGlobalProject div.sap-ui-dropdowndiv").html();
	// alert(project);
	
	switch(project){
		case "9.1_DEV":
			setTimeout(function() {
				set91();
			}, 1000);
			break;
		case "9.1_HANA_DEV":
			setTimeout(function() {
				set91hana();
			}, 1000);
			break;
		case "9.2_DEV":
		case "9.3_DEV":
			setTimeout(function() {
				set92();
			}, 1000);			
			break;
		case "9.2_HANA_DEV":
		case "9.3_HANA_DEV":
			setTimeout(function() {
				set92hana();
			}, 1000);			
			break;		
		default:
			alert("Sorry, current project is not supported now!");
	}
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
     if( request.message === "clicked_browser_action" ) {
        autoCheckTestCase();
    }
  }

);