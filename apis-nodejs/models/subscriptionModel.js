let mongoose = require('mongoose');
let Schema = mongoose.Schema;
//create our subscription scheme
let subscriptionSchema = new mongoose.Schema({
  organization_id: {
    'type': Schema.Types.ObjectId,
    'ref': 'Organization',
    required: true
},
  subscriptionId: {
    type: String,
  },
  customerId: {
    type: String,
  },
  planId: {
    type: String,
  },
  metaPlanId: {
    type: String,
  },
  note: {
    type: String,
    // required: true
  },
  seats_per_coupon: {
    type: Number,
    // required: true
  },
  
  max_member_per_coupon: {
    type: Number,
    required: false
  },
  planAmount: {
    type: String,
  },
  planItemId: {
    type: String
  },
  planName: {
    type: String,
  },
  quantity: {
    type: Number
  },
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'users'
  },
  status: {
    type: String,
  },
  amount:{type:String,default:""},
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phone: { type: String, required: true},
  quantity: { type: String, required: true},
  country: { type: String, required: true},
  city: { type: String, required: true},
  state: { type: String, default:""},
  postal_code: { type: String, required: true},
  address_line_1: { type: String, required: true},
  address_line_2: { type: String, required: true},
  organization: { type: String, required: true},
  interval: { type: String, required: true},
  start_date:{type: Date,required:true},
  couponCode: { type: String,default:""},
  couponId: { type: String,default:""},
  discountPrice: { type: String,default:""}
}, {
  timestamps: true,
  versionKey: false,
  collation: { locale: 'en', strength: 1 }
});


module.exports = mongoose.model('Subscription', subscriptionSchema)
