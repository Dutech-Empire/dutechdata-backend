export const buyDataBundle = async (req, res) => {
  try {

    res.json({
      message: "Data purchase endpoint working"
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};