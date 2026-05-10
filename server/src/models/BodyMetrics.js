const mongoose = require('mongoose');

const bodyMetricsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: { type: Date, default: Date.now },
  weight: { type: Number, required: true },  // kg
  height: { type: Number },                  // cm
  bmi: { type: Number },
  bmiCategory: { type: String },
  bodyFat: { type: Number },                 // percentage
  muscleMass: { type: Number },              // kg
  waist: { type: Number },                   // cm
  notes: { type: String },
}, { timestamps: true });

// Auto-calculate BMI before save
bodyMetricsSchema.pre('save', function (next) {
  if (this.weight && this.height) {
    const h = this.height / 100;
    this.bmi = parseFloat((this.weight / (h * h)).toFixed(1));
    if (this.bmi < 18.5) this.bmiCategory = 'Underweight';
    else if (this.bmi < 25) this.bmiCategory = 'Normal';
    else if (this.bmi < 30) this.bmiCategory = 'Overweight';
    else this.bmiCategory = 'Obese';
  }
  next();
});

module.exports = mongoose.model('BodyMetrics', bodyMetricsSchema);
