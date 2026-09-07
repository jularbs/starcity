import { userService } from './user.service.js';

export const remove = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await userService.getById(id);

    if (!user) return res.status(400).json({ error: 'User not found' });

    await userService.removeById(id);

    return res.json({
      success: 'User removed successfully',
    });
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      error: 'Failed to remove user. Please try again later.',
    });
  }
};

export const read = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await userService.getById(id);
    if (!user) return res.status(400).json({ error: 'User not found' });

    delete user.hashed_password;
    delete user.salt;
    return res.json(user);
  } catch (e) {
    console.log('Error: ', e);
    return res.status(400).json({ error: 'Error on getting user information' });
  }
};

export const update = async (req, res) => {
  const { _id } = req.body;

  const user = await userService.getById(_id);

  if (!user) return res.status(400).json({ error: 'User not found' });

  const update = {
    ...(req.body?.name && { name: req.body?.name }),
    ...(req.body?.status && { status: req.body?.status }),
    ...(req.body?.email && { email: req.body?.email }),
    ...(req.body?.department && { department: req.body?.department }),
  };

  try {
    await userService.updateById(_id, update);
    return res.json({
      success: 'User updated successfully',
    });
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      error: 'Failed to update user. Please try again later.',
    });
  }
};

export const list = async (req, res) => {
  const {
    query = '',
    department = '',
    skip = 0,
    limit = 0,
    status = false,
  } = req.query;

  const params = {
    query,
    department,
    status,
  };

  try {
    const users = await userService.list({
      params,
      skip: parseInt(skip),
      limit: parseInt(limit),
    });
    const count = await userService.countUsers(params);

    return res.json({
      data: users,
      count: count,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      error: 'Something went wrong',
    });
  }
};
