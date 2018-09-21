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
     uploadToCopyLeaks: function(filePath)
    {
        //Login to copyLeaks
        clCloud.login(email,apikey,config.E_PRODUCT.Education,callback);
        
        //Defining the callback function
        function callback(resp,err){
            //Setting headers
            var _customHeaders = {};
            _customHeaders[config.SANDBOX_MODE_HEADER] = true; // Sandbox mode - Scan without consuming any credits and get back dummy results

            /* Create a process using a file  */
            clCloud.createByFile(filePath,_customHeaders,function(resp,err){
                if(resp && resp.ProcessId){
                    console.log('API: create-by-file');
                    console.log('Process has been created: '+resp.ProcessId);
                    //TO:DO - Store resp.ProcessId (the process Id) into database in the DOCUMENT table
                    
                    //process Id will be used to retreive the process status(completed/in progress)
                    //process id will be used to retreive the results after it's completed  
                }
                    if(!isNaN(err))
                        console.log('Error: ' + err);
            });

        }
    },

    getProcessStatus: function(processId){
        clCloud.login(email,apikey,config.E_PRODUCT.Education,getStatusCallback);

        //Defining the callback function
        function getStatusCallback(resp,err){

            clCloud.getProcessStatus(processId,function(statusResp,err){
                console.log(statusResp); // says if the process has completed or is in progress  
                // /Sample json result::
                // { Status: 'Finished', ProgressPercents: 100 }
                if(!isNaN(err))
                console.log('Error: ' + err);
            });          
        }    
    },

    getProcessResults: function (processId){
        clCloud.login(email,apikey,config.E_PRODUCT.Education,getStatusCallback);

        //Defining the callback function
        function getStatusCallback(resp,err){
            clCloud.getProcessResults(processId,function(statusResp,err){
                console.log(statusResp);
                
                //Sample json result
               
                // [ { URL: 'http://example.com/',                                <==first Suspected url
                // Percents: 1,                                                   
                // NumberOfCopiedWords: 1,
                // ComparisonReport: 'https://api.copyleaks.com/v1/downloads/comparison?rid=5543521',
                // CachedVersion: 'https://api.copyleaks.com/v1/downloads/result-text?rid=5543521',
                // Title: 'Example Domain',
                // Introduction: 'No introduction available.',
                // EmbededComparison: 'https://copyleaks.com/compare-embed/a7b89bb8-52ac-47c8-9194-74a324b078c0/5543521' } ]
                
                /*Note : the response is an array , retrive each result as statusResp[0], statusResp[1] , statusResp[2] ... and so on*/

                /* Option 1: Use URL, percents, numberofcopiedwords to use in our own site
                /* Option 2: Use EmbeddedComparision to directly go to the site which shows the result in their own format . IT HAS HIGHLIGHTING AND ALL 
                THAT STUFF */
                
                var result = statusResp[0];
				clCloud.getComparisonReport(result.ComparisonReport,function(resp,err){
					console.log('Comparison report: ' + JSON.stringify(resp));
					if(!isNaN(err))
						console.log('Error: ' + err);
                });
                
                

                if(!isNaN(err))
                console.log('Error: ' + err);
            });         
        }    
    }
}