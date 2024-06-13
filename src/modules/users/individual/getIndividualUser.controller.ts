/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import IndividualUser from '../../authentication/individualUserAuth/individualUserAuth.model1';
import { emailValidator } from '../../../utilities/validator.utils';

// Get all users
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await IndividualUser.find();

    if (users.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'No users found'
      });
    }

    return res.status(200).json({
      status: 'success',
      data: { users }
    });
  } catch (err: any) {
    return handleDatabaseError(err, res, 'fetching users');
  }
};

// Get single user by ID
export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await IndividualUser.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }

    return res.status(200).json({
      status: 'success',
      data: { user }
    });
  } catch (err: any) {
    return handleDatabaseError(err, res, 'fetching the user');
  }
};

// Update user by ID
export const updateUserById = async (req: Request, res: Response) => {
  const { email, ...updateData } = req.body;

  if (email && !emailValidator(email)) {
    return res.status(400).json({
      status: 'fail',
      message: 'Invalid email format'
    });
  }

  try {
    const user = await IndividualUser.findByIdAndUpdate(req.params.id, { email, ...updateData }, {
      new: true,
      runValidators: true
    });

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }

    return res.status(200).json({
      status: 'success',
      data: { user }
    });
  } catch (err: any) {
    return handleDatabaseError(err, res, 'updating the user');
  }
};

// Handle database errors
const handleDatabaseError = (err: any, res: Response, action: string) => {
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      status: 'fail',
      message: `Invalid data provided while ${action}`
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      status: 'fail',
      message: 'Invalid user ID'
    });
  }

  return res.status(500).json({
    status: 'error',
    message: `An error occurred while ${action}. Please try again later.`,
    error: err.message
  });
};
