const CroneJob = require("cron").CronJob;
const { usersModel } = require("../model/users");
const { postModel } = require("../model/post");
const { savedPostModel } = require("../model/saved-post");
const { reportModel } = require("../model/report");
const ObjectId = require("mongoose").Types.ObjectId;

const job = new CroneJob(
    '* * * * * ',
    async function() {
        console.log(" -------- Cron Job Running -------- ");
        
        // // 1. fetch all users
        const users = await usersModel.find({},{ _id: 1, firstName: 1, lastName: 1});
        // console.log("user =>", users);


        // 2. iterate all user 
        for(let user of users){

            const userDetails = {};
            userDetails["userId"] = user._id;
            userDetails["fullName"] = `${user.firstName} ${user.lastName}`;
            userDetails["totalCreatedPost"] = await postModel.count({ postBy: user._id, isArchived : false });
            userDetails["totalSavedPost"] = await savedPostModel.count({savedBy: user._id});
            userDetails["totalSavedByOther"] = await savedPostModel.count({postBy: user._id});
            // console.log("userDetails =>", userDetails); 
            
            // if new user add then insert other wise update 
            await reportModel.updateOne(
                // conation
                {
                    userId: user._id
                },
                // update fields
                {
                    $set: userDetails
                },
                // options: (if new user come then insert other wise update their details)
                {
                    upsert: true
                }
            );
            
            // allUsersList.push(userDetails);
        }        

    },
    null,
    true,
    'America/Los_Angeles'
);

module.exports = { job };