const notifications = {
  bookingForMentor: {
    title: 'New Booking',
    message: 'You have received a new booking, check now!'
  },
  bookingForStudent: {
    title: 'Booked successfully',
    message: 'You have successfully booked mentor!'
  },
  donateForStudent: {
    title: 'Received new donations',
    message: 'You have been donated ${a rocket} from ${abc}'
  }
  ,
  donateForStudent: {
    title: 'Donate successfully',
    message: 'You have successfully donated to the mentor.'
  },
  reportForMentor: {
    title: 'You have received a complaint',
    message: 'You have received 1 complaint about support quality, please contact fptmentor@gmail.com for more information.'
  },
  reportForStudent: {
    title: 'Response to your complaint',
    message: 'Your complaint is under review, please wait.'
  },
  reportSuccessForMentor: {
    title: 'Warning notice',
    message: 'You have been deducted ${point} for poor support'
  },
  reportSuccessForStudent: {
    title: 'Response to your complaint',
    message: 'Your wallet credit has been refunded for your successful complaint, thank you for your support'
  },
  reportFailForMentor: {
    title: 'Notification',
    message: 'Thanh you for you support about complaint'
  },
  reportFailForStudent: {
    title: 'Notification',
    message: 'Thanh you for you support about complaint'
  },
}

module.exports = notifications;