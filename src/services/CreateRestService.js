const Service = require("./Service"),
  mongoose = require("mongoose"),
  PendingRestServiceQery = mongoose.model("PendingRestService"),
  RestServiceQery = mongoose.model("RestService");

module.exports = class RestService extends Service {
  constructor({ swaggerFile, ...properties }) {
    super(properties);
    this.swaggerFile = swaggerFile;
  }

  async addService() {
    const { serviceNameHeb, serviceNameEng } = this

    const isExist = await RestServiceQery.find({ $or: [{ serviceNameHeb }, { serviceNameEng }] })
    console.log(isExist)
    if (isExist.length > 0) {
      const err = new Error("duplicate service")
      err.status = 409
      throw err
    }
    const pendingRestServiceQery = PendingRestServiceQery(this)
    try {
      const result = await pendingRestServiceQery.save();
      return result

    } catch ({ code, errmsg }) {
      console.log(errmsg)
      if (code == 11000) {
        const err = new Error("duplicate service")
        err.status = 409
        throw err
      } else {
        throw code
      }

    }

  }

  async updateService(obj) {

    const { serviceNameEng } = this
    let result = await PendingRestServiceQery.findOneAndUpdate(
      { serviceNameEng },
      {
        $set: obj
      }
    );
    return result




  }

  async getService(serviceNameEng) {
    let result = null


    if (serviceNameEng) {
      result = await PendingRestServiceQery.find({ serviceNameEng });

    } else {

      result = await PendingRestServiceQery.find();
    }
    return result



  }

  static async reject(id) {
    const result = await PendingRestServiceQery.findByIdAndUpdate({ _id: id }, { $set: { status: "rejected" } })
    return result

  }
  static async aprove(id) {

    // eslint-disable-next-line no-unused-vars
    let { _doc: { status, ...details } } = await PendingRestServiceQery.findByIdAndDelete(
      { _id: id }
    );
    console.log(details)
    const soapServiceQery = PendingRestServiceQery(details)

    const result = await soapServiceQery.save();

    return result

  }
  async pendingdetails(id) {
    const obj = { ...this, status: "pendingAprove" }
    const result = await PendingRestServiceQery.findByIdAndUpdate({ _id: id }, { $set: obj })
    return result

  }

};