import asyncHandler from '../middleware/asyncHandler.js';
import Contact from '../models/contactModel.js';

// @desc    Create a new contact message
// @route   POST /api/contact
// @access  Public
const createContact = asyncHandler(async (req, res) => {
  const { name, email, message } = req.body;

  const contact = new Contact({
    name,
    email,
    message,
  });

  const createdContact = await contact.save();
  res.status(201).json(createdContact);
});

// @desc    Get all contact messages
// @route   GET /api/contact
// @access  Private/Admin
const getContacts = asyncHandler(async (req, res) => {
  const contacts = await Contact.find({}).sort({ createdAt: -1 });
  res.json(contacts);
});

// @desc    Delete a contact message
// @route   DELETE /api/contact/:id
// @access  Private/Admin
const deleteContact = asyncHandler(async (req, res) => {
  const contact = await Contact.findById(req.params.id);

  if (contact) {
    await Contact.deleteOne({ _id: contact._id });
    res.json({ message: 'Contact message removed' });
  } else {
    res.status(404);
    throw new Error('Contact message not found');
  }
});

// @desc    Update contact message to read
// @route   PUT /api/contact/:id/read
// @access  Private/Admin
const updateContactToRead = asyncHandler(async (req, res) => {
  const contact = await Contact.findById(req.params.id);

  if (contact) {
    contact.isRead = true;
    const updatedContact = await contact.save();
    res.json(updatedContact);
  } else {
    res.status(404);
    throw new Error('Contact message not found');
  }
});

export { createContact, getContacts, deleteContact, updateContactToRead };
