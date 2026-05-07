import { Aircraft } from "../../model/AirplaneModel/aircraftModel.js";
import { Airline } from "../../model/AirplaneModel/airlineModel.js";
import { generateSeats } from "../../utils/generateSeats.js";
import mongoose from "mongoose";


// Define seat types for a 3-seat layout
const seatTypes = ["window", "middle", "aisle"];

// Default row counts for each class
const defaultRowCounts = {
  Economy: 20,
  Business: 5,
  First: 2,
};

export const createAircraft = async (req, res) => {
  try {
    const id = req.params.id; // airline ID
    const airline = await Airline.findById(id);

    if (!airline) {
      return res.status(400).json({ message: "Airline not found" });
    }

    const { name, code, status, classes } = req.body;

    if (!name || !code || !classes) {
      return res.status(400).json({ message: "All details mandatory" });
    }

    // Process classes and generate seats
    const processedClasses = classes.map((cls) => {
      const { classType } = cls;
      let numRows = cls.rows; // user provided rows

      // if no rows provided, assign default
      if (!numRows || numRows <= 0) {
        numRows = defaultRowCounts[classType] || 0;
      }

      const generatedRows = [];

      for (let r = 0; r < numRows; r++) {
        const seats = [];

        for (let s = 0; s < seatTypes.length; s++) {
          const seatNo = `${r + 1}${String.fromCharCode(65 + s)}`; // 1A, 1B, 1C ...
          const seatType = seatTypes[s];

          seats.push({
            seatNo,
            seatType,
            isAvailable: true,
          });
        }

        generatedRows.push({
          rowNo: r + 1,
          seats,
        });
      }

      return {
        classType,
        rows: generatedRows,
      };
    });

    // Calculate total seats
    const totalSeats = processedClasses.reduce((acc, cls) => {
      return (
        acc +
        cls.rows.reduce((rAcc, row) => rAcc + row.seats.length, 0)
      );
    }, 0);

    // Create aircraft
    const aircraft = await Aircraft.create({
      name,
      code,
      status,
      airline: airline._id,
      totalSeats,
      classes: processedClasses,
    });

    // Link aircraft to airline
    airline.aircrafts.push(aircraft._id);
    await airline.save();

    return res.status(200).json({
      message: `Aircraft ${name} created successfully for airline ${airline.name}`,
      success: true,
      aircraft,
    });
  } catch (error) {
    console.error("Error creating aircraft:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};


export const getAircraftsByAirline = async (req, res) => {
  try {
    const { airlineId } = req.params; // airlineId

    // Find airline by ID and populate aircraft details
    const airline = await Airline.findById(airlineId).populate("aircrafts");

    if (!airline) {
      return res.status(404).json({
        success: false,
        message: "Airline not found.",
      });
    }

    return res.status(200).json({
      success: true,
      aircrafts: airline.aircrafts,
    });
  } catch (error) {
    console.error("Error fetching aircrafts:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};



export const updateAircraft = async (req, res) => {
  try {
    const { name, code, status, classes } = req.body;
    const  id  = req.params.id; // Aircraft ID

    const aircraft = await Aircraft.findById(id);
    if (!aircraft) {
      return res.status(404).json({ success: false, message: "Aircraft not found" });
    }

    if (name !== undefined) aircraft.name = name;
    if (code !== undefined) aircraft.code = code;
    if (status !== undefined) aircraft.status = status;
    if (classes !== undefined) aircraft.classes = classes;

    await aircraft.save();

    return res.status(200).json({
      message : 'Aircraft details updated.',
      aircraft,
      success : true
    })
  


  } catch (error) {
    console.log(error);
  }
}



export const deleteAircraft = async (req, res) => {
  try {
    const { id } = req.params; // Aircraft ID

    // Find aircraft
    const aircraft = await Aircraft.findById(id);
    if (!aircraft) {
      return res.status(404).json({ success: false, message: "Aircraft not found" });
    }

    // Find airline and remove reference
    const airline = await Airline.findById(aircraft.airline);
    if (airline) {
      airline.aircrafts = airline.aircrafts.filter(
        (airId) => airId.toString() !== id.toString()
      );
      await airline.save();
    }

    // Delete aircraft
    await Aircraft.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: `Aircraft ${aircraft.name} deleted successfully`,
    });
  } catch (error) {
    console.error("Error deleting aircraft:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

