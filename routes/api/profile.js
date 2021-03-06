const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator");
const Profile = require("../../models/profile");
const User = require("../../models/User");
// //@route Get api/profile
// //@desc Get current users profile
// //@access private

router.get("/me", auth, async (req, res) => {
  try {
    const profile = await (
      await Profile.findOne({ user: req.user.id })
    ).populate("user", ["name", "avatar"]);
    if (!profile) {
      return res.status(400).json({ msg: "There is no profile for this user" });
    }
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
//@route Post api/profile
//@desc create or update user profile
//@access private
router.post(
  "/",
  [
    auth,
    [
      check("status", "Status is required")
        .not()
        .isEmpty(),
      check("skills", "skills is required")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin
    } = req.body;

    //build profile object

    const profileFields = {};
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;
    if (skills) {
      profileFields.skills = skills.split(',').map(skill => skill.trim());
    }

        //build social objects
    profileFields.social ={}
    if (youtube) profileFields.social.youtube = youtube;
    if(twitter) profileFields.social.twitter = twitter;
    if (facebook) profileFields.social.facebook = facebook;
    if (linkedin) profileFields.social.linkedin = linkedin;
    //if (istagram) profileFields.social.instagram = instagram;

        try
    {
        let profile = await Profile.findOne({ user: req.user.id });
        if(profile)
        {
        //update
            profile = await Profile.findOneAndUpdate(
                {user: req.user.id},
                {$set: profileFields},
                {new:true}                                              //chapter17
                );

                return res.json(profile);
        }
        //create
             
         profile = new Profile(profileFields);
        await profile.save();
        res.json(profile);

    }catch(err){
        console.error(err.message);
        res.status(500).send('serverError');
    }
}
);
//@route Get api/profile/user/:user_id
//@desc Get profile by user ID
//@access Pubilic
router.get('/user/:user_id', async (req, res) =>{
        try{
            const profile = await Profile.findOne({user: req.params.user_id}).populate('user', 
            ['name', 'avatar']);
            
        if(!profile) return res.status(400).json({ msg: 'There is no profile for this user' });   
        res.json(profile);

        }catch(err){
            console.error(err.message);
            if(err.kind == 'ObjectId')
            {
            res.status(500).send('profile not found');
            }
        }

    }
    // res.send('Hello');

);

// //@route delete api/profile
// //@desc delete profile user & post
// //@access private

router.delete('/', auth, async (req, res) => {
    try {
        //Remove Profile
      await Profile.findOneAndRemove({ user: req.user.id });
      //Remove USer
      await User.findOneAndRemove({ _id: req.user.id });

      res.json({ msg: 'user deleted' });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  });
  // //@route put api/profile/experience
// //@desc add profile experience
// //@access private

router.put('/experience', [
    auth,
    [
        check('title', 'Title is required')
        .not()
        .isEmpty(),
        check('company', 'company is required')
        .not()
        .isEmpty(),
        check('from', 'From date is required')
        .not()
        .isEmpty(),
    ]
],
async (req, res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty())
    {
        return res.status(400).json({ errors: errors.array() })
    }
    const {
        title,
        company,
        location,
        from,
        to,
        current,
        description
    } = req.body;
    const newExp = {
        title,
        company,
        location,
        from, 
        to,
        current,
        description
    }
    try{
        const profile = await Profile.findOne({ user: req.user.id });

        profile.experience.unshift(newExp); 
        
        await profile.save();
        
        res.json(profile);
        
    }catch (err){
        console.error(err.message);
        res.status(500).send('Server Error');
    }
}
);

//@route put api/profile/experience
// //@desc add profile experience
// //@access private
router.delete('/experience/:exp_id', auth, async (req, res) =>{
  try{
    const profile = await Profile.findOne({ user: req.user.id });
    const removeIndex = profile.experience
          .map(item => item.id)
          .indexOf(req.params.exp_id);
     profile.experience.splice(removeIndex, 1);
     await profile.save();   
     
     res.json(profile);

  }catch (err) {
    console.errpr(err.message);
    res.status(500).send('Server Error');

  }
});

router.put('/education', [
  auth,
  [
      check('school', 'school is required')
      .not()
      .isEmpty(),
      check('degree', 'Degree is required')
      .not()
      .isEmpty(),
      check('fieldofstudy', 'field of study is required')
      .not()
      .isEmpty(),
  ]
],
async (req, res) => {
  const errors = validationResult(req)
  if(!errors.isEmpty())
  {
      return res.status(400).json({ errors: errors.array() })
  }
  const {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description
  } = req.body;
  const newEdu = {
    school,
    degree,
    fieldofstudy,
      from, 
      to,
      current,
      description
  }
  try{
      const profile = await Profile.findOne({ user: req.user.id });

      profile.education.unshift(newEdu); 
      
      await profile.save();
      
      res.json(profile);
      
  }catch (err){
      console.error(err.message);
      res.status(500).send('Server Error');
  }
}
);

//@route delete api/profile/education
// //@desc add profile education
// //@access private
router.delete('/education/:edu_id', auth, async (req, res) =>{
try{
  const profile = await Profile.findOne({ user: req.user.id });
  const removeIndex = profile.experience
        .map(item => item.id)
        .indexOf(req.params.edu_id);
   profile.education.splice(removeIndex, 1);
   await profile.save();   
   
   res.json(profile);

}catch (err) {
  console.errpr(err.message);
  res.status(500).send('Server Error');

}
});

module.exports = router;





