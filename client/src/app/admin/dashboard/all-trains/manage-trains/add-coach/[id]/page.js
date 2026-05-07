'use client';

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";
import { useParams } from "next/navigation";
import { useSelector } from "react-redux";

const coachPrefix = {
  AC: "A",
  Sleeper: "S",
  General: "G",
};

const berthTypes = ["UpperBerth", "LowerBerth", "MiddleBerth", "SideUpper", "SideLower"];

const AddCoachSlots = () => {
  const { id } = useParams();
  const { selectedTrain } = useSelector((state) => state.trains);
  const [train, setTrain] = useState(selectedTrain);
  const [coachType, setCoachType] = useState("AC");
  const [count, setCount] = useState(0);
  const [slots, setSlots] = useState([]);

  useEffect(() => {
    const prefix = coachPrefix[coachType] || coachType.charAt(0).toUpperCase();
    const existingCount =
      train?.coaches?.find((c) => c.coachType.toLowerCase() === coachType.toLowerCase())?.coachList?.length || 0;

    const temp = Array.from({ length: count }, (_, i) => ({
      coachName: `${prefix}${existingCount + i + 1}`,
      seatTypeDetails: berthTypes.map((type) => ({
        seatType: type,
        totalSeats: "",
        availableSeats: ""
      }))
    }));

    setSlots(temp);
  }, [count, coachType]);

  const handleSeatChange = (slotIndex, berthIndex, field, value) => {
    const updated = [...slots];
    updated[slotIndex].seatTypeDetails[berthIndex][field] = value;
    setSlots(updated);
  };

  const removeSlot = (index) => {
    const updated = [...slots];
    updated.splice(index, 1);
    setSlots(updated);
    setCount((prev) => prev - 1);
  };

  const createCoachHandler = async () => {
    const isIncomplete = slots.some(slot =>
      slot.seatTypeDetails.some(s => !s.totalSeats || !s.availableSeats)
    );

    if (isIncomplete) {
      alert("Please fill all seat details for each berth type.");
      return;
    }

    try {
      const payload = {
        coachType,
        coaches: slots
      };

      const res = await axios.post(
        `http://localhost:8000/api/v1/train/add-coach/${id}`,
        payload,
        {
          headers: {
            "Content-Type": "application/json"
          },
          withCredentials: true
        }
      );

      if (res.data.success) {
        console.log(res.data.train);
        alert("Coaches added successfully!");
        setSlots([]);
        setCount(0);
      }
    } catch (error) {
      console.error("❌ Error adding coaches:", error);
      alert("Failed to add coaches.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <Card className="shadow-md border border-gray-300">
        <CardContent className="space-y-4 pt-6">
          <h2 className="text-2xl font-semibold text-gray-800">➕ Add Coaches</h2>

          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              value={coachType}
              onChange={(e) => setCoachType(e.target.value)}
              placeholder="Coach Type (AC/Sleeper)"
              className="sm:w-[200px]"
            />
            <Input
              type="number"
              min={1}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              placeholder="No. of Coaches"
              className="sm:w-[200px]"
            />
          </div>

          {slots.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4">
              {slots.map((slot, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className="bg-white border shadow-sm relative rounded-2xl p-4">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => removeSlot(index)}
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={18} />
                    </Button>
                    <div className="space-y-2">
                      <p className="font-semibold text-lg text-gray-700">Coach {slot.coachName}</p>

                      {slot.seatTypeDetails.map((berth, berthIndex) => (
                        <div key={berthIndex} className="flex gap-2 items-center">
                          <span className="w-[120px]">{berth.seatType}</span>
                          <Input
                            type="number"
                            placeholder="Total"
                            value={berth.totalSeats}
                            onChange={(e) =>
                              handleSeatChange(index, berthIndex, "totalSeats", e.target.value)
                            }
                          />
                          <Input
                            type="number"
                            placeholder="Available"
                            value={berth.availableSeats}
                            onChange={(e) =>
                              handleSeatChange(index, berthIndex, "availableSeats", e.target.value)
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {slots.length > 0 && (
            <div className="pt-4">
              <Button
                onClick={createCoachHandler}
                className="bg-gradient-to-r from-green-500 to-green-700 text-white px-6 py-2 rounded-xl hover:from-green-600 hover:to-green-800"
              >
                ➕ Add All Coaches
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AddCoachSlots;
