import { Airline } from "../../model/AirplaneModel/airlineModel.js";
import cloudinary from "../../utils/lib/cloudinary.js";


export const createAirline = async (req, res) => {
  try {
    const { name, code, country, status, contact } = req.body;

    if (!name || !code || !country || !status || !contact) {
      return res.status(400).json({ message: "All details are mandatory" });
    }

    // // 🖼️ check if logo image is uploaded
    // if (!req.file) {
    //   return res.status(400).json({ message: "Logo image is required" });
    // }

    // 🚀 Upload logo to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(req.file.path, {
      folder: "airlines/logos",
      resource_type: "image",
    });

    // ✅ Save Airline in DB with uploaded logo URL
    const newAirline = await Airline.create({
      name,
      code,
      logo: uploadResult.secure_url || "", // store Cloudinary URL
      country,
      status,
      contact,
    });

    return res.status(201).json({
      success: true,
      message: `${name} Airline created successfully.`,
      airline: newAirline,
    });
  } catch (error) {
    console.error("Error creating airline:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateAirline = async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);

    const airlineId = req.params.id;
    const { name, code, country, status } = req.body || {};

    let contact = {};
    if (req.body?.contact) {
      try {
        contact = JSON.parse(req.body.contact);
      } catch (e) {
        console.error("Failed to parse contact JSON:", e);
      }
    }

    const airline = await Airline.findById(airlineId);
    if (!airline) {
      return res.status(404).json({ success: false, message: "Airline not found" });
    }

    if (name) airline.name = name;
    if (code) airline.code = code;
    if (country) airline.country = country;
    if (status) airline.status = status;
    if (Object.keys(contact).length > 0) {
      airline.contact = { ...airline.contact, ...contact };
    }

    if (req.file) {
      const uploadedLogo = await cloudinary.uploader.upload(req.file.path, {
        folder: "airlines/logos",
        resource_type: "image",
      });
      airline.logo = uploadedLogo.secure_url;
    }

    await airline.save();

    res.status(200).json({
      success: true,
      message: "Airline updated successfully",
      airline,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

  
export const deleteAirline = async(req, res) => {
    try {
        const airlineId = req.params.id;

        const airline = await Airline.findByIdAndDelete(airlineId);

        if(!airline){
            return res.status(400).json({
                message : 'Airline not found'
            })
        }

        return res.status(200).json({
            message : 'Airline deleted.',
            success : true
        })



      

    } catch (error) {
        console.log(error);
    }
}

export const getAllAirlines = async (_, res) => {
  try {
    const allAirlines = await Airline.find().sort({ createdAt: -1 });

    return res.status(200).json({
        success : true,
      allAirlines
    })
  } catch (error) {
    console.log(error);
  }
}