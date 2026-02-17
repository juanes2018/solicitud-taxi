const { registerUser, loginUser } = require('../services/authService'); 

const register = async (req, res) => {
   try {
      const { email, password, name, role} = req.body;
      await registerUser(email, password, name, role);
      res.status(201).json({message: 'Usuario registrado satisfactoriamente'});   
   } catch (error) {
   return res.status(400).json({message: error.message});
}
};


const login = async (req, res) => {
   try {
      const { email, password } = req.body;
      const token = await loginUser(email, password);
      res.json({ token});

   } catch (error) {
      return res.status(400).json({message: error.message});

   }
};

module.exports = { register, login };

   













