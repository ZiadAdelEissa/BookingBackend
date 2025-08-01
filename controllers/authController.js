import User from '../models/User.js';
import Branch from '../models/Branch.js';
// Simple session-based authentication (no JWT/bcrypt as requested)
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('🔑 Login attempt:', { email, password: password ? '***' : 'empty' });
    
    const user = await User.findOne({ email, password });
    console.log('👤 User found:', user ? { id: user._id, email: user.email, role: user.role } : 'null');
    
    if (!user) {
      console.log('❌ Login failed - invalid credentials');
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Store user in session
     req.session.save((err) => {
      if (err) {
        console.log('💥 Session save error:', err);
        return res.status(500).json({ message: 'Session save failed', error: err.message });
      }
      
      console.log('✅ Login successful, session created and saved');
      console.log('🔍 Session ID:', req.sessionID);
      console.log('🔍 Session data:', { userId: user._id, email: user.email, role: user.role });
      console.log('🔍 Cookie settings:', req.session.cookie);
      
      res.json({ 
        message: 'Logged in successfully', 
        user,
        sessionId: req.sessionID // Include session ID for debugging
      });
    });
  } catch (error) {
    console.log('💥 Login error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const logout = (req, res) => {
  req.session.destroy();
  res.json({ message: 'Logged out successfully' });
};

export const register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    const user = new User({ name, email, phone, password });
    await user.save();
    res.status(201).json({ message: 'User registered successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};
export const adminRegister = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

    // 1. Validate role exists
    if (!role) throw new Error('Role is required');
    
    // 2. Create user WITH explicit role
    const user = new User({
      name,
      email,
      phone,
      password,
      role, // Will now save exactly what you send
      branch: role === 'branch-admin' ? req.body.branch : null
    });

    // 3. Force-save (bypass any potential defaults)
    await user.save({ validateBeforeSave: true });
    
    res.status(201).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role // Verify in response
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
export const registerBranchAdmin = async (req, res) => {
    try {
      const { name, email, phone, password, branchId } = req.body;
      
      // Verify branch exists
      const branch = await Branch.findById(branchId);
      if (!branch) {
        return res.status(400).json({ message: 'Branch not found' });
      }
  
      const user = new User({ 
        name, 
        email, 
        phone, 
        password,
        role: 'branch-admin',
        branch: branchId
      });
      
      await user.save();
      res.status(201).json({ message: 'Branch admin registered successfully', user });
    } catch (error) {
      res.status(500).json({ message: 'Registration failed', error: error.message });
    }
  };