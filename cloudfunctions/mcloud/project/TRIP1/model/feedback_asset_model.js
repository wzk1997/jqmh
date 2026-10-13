const BaseProjectModel=require('./base_project_model.js');
class FeedbackAsset extends BaseProjectModel {}
FeedbackAsset.CL=BaseProjectModel.C('feedback_asset');
FeedbackAsset.FIELD_PREFIX='FEEDBACK_ASSET_';
FeedbackAsset.UPDATE_IP=false;
FeedbackAsset.DB_STRUCTURE={_id:'string|true',_pid:'string|true',FEEDBACK_ASSET_ID:'string|true',FEEDBACK_ASSET_OWNER:'string|true',FEEDBACK_ASSET_REQUEST:'string|true',FEEDBACK_ASSET_FILE:'string|true',FEEDBACK_ASSET_ADD_TIME:'int|true',FEEDBACK_ASSET_EDIT_TIME:'int|true'};
module.exports=FeedbackAsset;
