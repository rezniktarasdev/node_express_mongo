const {Schema, model} = require('mongoose')

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    name: String,
    password: {
        type: String,
        requried: true
    },
    resetToken: String,
    resetTokenExp: Date,
    cart: {
        items: [
            {
                count: {
                    type: Number,
                    required: true,
                    default: 1
                },
                courseId: {
                    type: Schema.Types.ObjectId,
                    ref: 'Course',
                    required: true
                }

            }
        ]
    }
})

userSchema.methods.addToCart = function(course) {
    const clonedItems = [...this.cart.items]
    const idx = clonedItems.findIndex(c => {
        return c.courseId.toString() === course._id.toString()
    })

    if (idx >= 0 ) {
        clonedItems[idx].count += 1
    } else {
        clonedItems.push({
            courseId: course._id,
            count: 1
        })
    }

    this.cart = {items: clonedItems}

    return this.save()
}

userSchema.methods.removeFromCart = function(id) {
    let clonedItems = [...this.cart.items]
    const idx = clonedItems.findIndex(c => c.courseId.toString() === id.toString())

    if (clonedItems[idx].count === 1) {
        clonedItems = clonedItems.filter(c => c.courseId.toString() !== id.toString())
    } else {
        clonedItems[idx].count--
    }

    this.cart = {items: clonedItems}

    return this.save()
}

userSchema.methods.clearCart = function() {
    this.cart = {items: []}
    
    return this.save()
}

module.exports = model('User', userSchema )