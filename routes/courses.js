const {Router} = require('express')
const Course = require('../models/course')
const auth = require('../middleware/auth')
const router = Router()

router.get('/', async (req, res) => {
  const courses = await Course.find()
    .populate('userId', 'email name')
    .select('price title img')
    .lean()

  res.render('courses', {
    title: 'Course',
    isCourses: true,
    courses
  })
})

router.get('/:id/edit', auth, async (req, res) => {
  if (!req.query.allow) {
    return res.redirect('/')
  }

  const course = await Course.findById(req.params.id).lean()

  res.render('course-edit', {
    title: `Edit ${course.title}`,
    course
  })
})

router.post('/edit', auth, async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.redirect('/courses');
  }
  
  delete req.body.id
  await Course.findByIdAndUpdate(id, req.body).lean()

  res.redirect('/courses')
})

router.post('/remove', auth,  async (req, res) => {
  try {
    await Course.deleteOne({_id: req.body.id})
    
  } catch(e) {
    console.log(e)
  }

  res.redirect('/courses')

})

router.get('/:id', async (req, res) => {
  const course = await Course.findById(req.params.id).lean()

  res.render('course', {
    layout: 'empty',
    title: `Курс ${course.title}`,
    course
  })
})

module.exports = router