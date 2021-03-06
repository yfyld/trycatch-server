import {Subscription} from "egg"
class UserCount extends Subscription {
  ErrorModel:any
  LogModel:any
  LogServer:any
  constructor(ctx){
    super(ctx);
    this.ErrorModel = ctx.model.Error;
    this.LogModel = ctx.model.Log;
    this.LogServer=ctx.service.Log;
  }
  static get schedule() {
    return {
      interval: '1h',
      type: 'all'
    };
  }


  async subscribe() {
    const Op = this.ctx.app.Sequelize.Op;
    
    const errors = await this.ErrorModel.findAll({
      where: {
        updated_at: {
          [Op.gt]: Date.now()-3600*1000*1
        }
      },
      raw: true
    });


    if(!errors.length){
      return;
    }

    for(let error of errors){
      const response:any=await this.ctx.service.log.list({errorId: error.id})

      const userCount=new Set(response.data.list.map(item => item.customId)).size;

      await this.ErrorModel.update({
        userCount
      },{
        where: {
          id: error.id
        }
      });

    }

  }
}


export default UserCount;
