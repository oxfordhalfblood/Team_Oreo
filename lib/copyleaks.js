const express = require ('express');
const bodyParser = require ('body-parser');

const router = express.Router();

router.use(bodyParser.json());


//For the use of Copyleaks node sdk
var CopyleaksCloud = require('plagiarism-checker');
var clCloud = new CopyleaksCloud();
var config = clCloud.getConfig();

//Setting credentials
var email = 'nipeshkc7@gmail.com';
var apikey = 'AF14A871-CA6B-4FC9-8B78-38835EF0668F';

module.exports= {
     uploadToCopyLeaks: function(filePath,dbInstance,filename,date)
    {
        //Login to copyLeaks
        clCloud.login(email,apikey,config.E_PRODUCT.Education,function (resp,err){
            //Setting headers
            var _customHeaders = {};
            _customHeaders[config.SANDBOX_MODE_HEADER] = true; // Sandbox mode - Scan without consuming any credits and get back dummy results

            /* Create a process using a file  */
            clCloud.createByFile(filePath,_customHeaders,function(resp,err){
                if(resp && resp.ProcessId){
                    console.log('API: create-by-file');
                    console.log('Process has been created: '+resp.ProcessId);
                }
                    if(!isNaN(err))
                        console.log('Error: ' + err);
            });

        });
        
        //Defining the callback function
        
    },

    getProcessStatus: function(processId){
        clCloud.login(email,apikey,config.E_PRODUCT.Education,  function(resp,err){

            clCloud.getProcessStatus(processId,function(statusResp,err){
                console.log(statusResp); // says if the process has completed or is in progress  
                // /Sample json result::
                // { Status: 'Finished', ProgressPercents: 100 }
                if(!isNaN(err))
                console.log('Error: ' + err);
            });          
        });
          
    },

    getProcessResults: function (processId){
        clCloud.login(email,apikey,config.E_PRODUCT.Education,function getStatusCallback(resp,err){
            clCloud.getProcessResults(processId,function(statusResp,err){
                console.log(statusResp);
                var result = statusResp[0];
				clCloud.getComparisonReport(result.ComparisonReport,function(resp,err){
					console.log('Comparison report: ' + JSON.stringify(resp));
					if(!isNaN(err))
						console.log('Error: ' + err);
                });

                if(!isNaN(err))
                console.log('Error: ' + err);
            });         
        } );
           
    }
}