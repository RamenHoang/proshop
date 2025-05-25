// @ts-check
import mongoose from 'mongoose';

/**
 * Checks if the req.params.id is a valid Mongoose ObjectId.
 *
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The Express next middleware function.
 * @throws {Error} Throws an error if the ObjectId is invalid.
 */

const checkObjectId = (req, res, next) => {
  const id = req.params.id;
  
  if (!id) {
    return res.status(400).json({ message: 'ID parameter is missing' });
  }
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ 
      message: `Invalid ObjectId: ${id}` 
    });
  }
  
  next();
};

export default checkObjectId;
