"use client";

import { useState } from "react";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { setCoaches } from "@/redux/trainSlice";
import { useDispatch, useSelector } from "react-redux";
import { Plus, Train, Coins, Hash, Loader2, User, Users } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";

export default function AddCoachDialog({ trainId, onCoachAdded }) {
  const dispatch = useDispatch();
  const coaches = useSelector((state) => state.trains.coaches);
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [coachType, setCoachType] = useState("");
  const [coachName, setCoachName] = useState("");
  const [pricePerSeat, setPricePerSeat] = useState("");
  const [seatTypes, setSeatTypes] = useState([
    { seatType: "UpperBerth", totalSeats: 20, availableSeats: 20 },
    { seatType: "LowerBerth", totalSeats: 20, availableSeats: 20 },
    { seatType: "MiddleBerth", totalSeats: 20, availableSeats: 20 },
    { seatType: "SideUpper", totalSeats: 20, availableSeats: 20 },
    { seatType: "SideLower", totalSeats: 20, availableSeats: 20 },
  ]);

  const handleSeatChange = (index, field, value) => {
    const updatedSeats = [...seatTypes];
    updatedSeats[index][field] = Number(value);
    setSeatTypes(updatedSeats);
  };

  const handleSubmit = async () => {
    // Validation
    if (!coachType) {
      toast.error("Please select a coach type");
      return;
    }
    
    if (!coachName) {
      toast.error("Please enter a coach name");
      return;
    }
    
    if (!pricePerSeat || pricePerSeat <= 0) {
      toast.error("Please enter a valid price per seat");
      return;
    }
    
    if (seatTypes.some(seat => seat.totalSeats <= 0 || seat.availableSeats < 0 || seat.availableSeats > seat.totalSeats)) {
      toast.error("Please check seat values. Available seats cannot exceed total seats.");
      return;
    }

    setIsLoading(true);
    
    try {
      const { totalSeats, availableSeats } = seatTypes[0];
      const res = await axios.post(
        `http://localhost:8000/api/v1/train/add-coach/${trainId}`,
        {
          coachType,
          coachName,
          totalSeats,
          availableSeats,
          pricePerSeat: Number(pricePerSeat)
        },
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          }
        

      );
      
      if (res.data.success) {
        alert(res.data.message);
        toast.success("Coach added successfully");
        
        // If API returns updated list:
        if (Array.isArray(res.data.coaches)) {
          dispatch(setCoaches(res.data.coaches));
          onCoachAdded && onCoachAdded(res.data.coaches);
        } 
        // If API returns single new coach object:
        else {
          dispatch(setCoaches([...coaches, res.data.coaches].filter(Boolean)));
          onCoachAdded && onCoachAdded([...coaches, res.data.coaches].filter(Boolean));
        }
        
        // Reset form
        setCoachType("");
        setCoachName("");
        setPricePerSeat("");
        setSeatTypes([
          { seatType: "UpperBerth", totalSeats: 20, availableSeats: 20 },
          { seatType: "LowerBerth", totalSeats: 20, availableSeats: 20 },
          { seatType: "MiddleBerth", totalSeats: 20, availableSeats: 20 },
          { seatType: "SideUpper", totalSeats: 20, availableSeats: 20 },
          { seatType: "SideLower", totalSeats: 20, availableSeats: 20 },
        ]);
        
        setOpen(false);
      }
      
    } catch (error) {
      console.error("Error adding coach:", error);
      toast.error(error.response?.data?.message || "Failed to add coach");
    } finally {
      setIsLoading(false);
    }
  };

  const formatSeatType = (seatType) => {
    return seatType.replace(/([A-Z])/g, ' $1').trim();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" /> Add Coach
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Train className="w-5 h-5" /> Add New Coach
          </DialogTitle>
          <DialogDescription>
            Fill in the details below to add a new coach to this train.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Coach Type */}
          <div className="space-y-2">
            <Label htmlFor="coach-type">Coach Type</Label>
            <Select value={coachType} onValueChange={setCoachType}>
              <SelectTrigger>
                <SelectValue placeholder="Select coach type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AC">AC</SelectItem>
                <SelectItem value="Sleeper">Sleeper</SelectItem>
                <SelectItem value="EC">EC</SelectItem>
                <SelectItem value="CC">CC</SelectItem>
                <SelectItem value="General">General</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Coach Name */}
            <div className="space-y-2">
              <Label htmlFor="coach-name">Coach Name</Label>
              <Input
                id="coach-name"
                value={coachName}
                onChange={(e) => setCoachName(e.target.value)}
                placeholder="e.g., A3, S5"
              />
            </div>

            {/* Price per seat */}
            <div className="space-y-2">
              <Label htmlFor="price">Price Per Seat (₹)</Label>
              <div className="relative">
                <Coins className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="price"
                  type="number"
                  value={pricePerSeat}
                  onChange={(e) => setPricePerSeat(e.target.value)}
                  placeholder="Enter price"
                  className="pl-10"
                  min="1"
                />
              </div>
            </div>
          </div>

          {/* Seat Types */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <Label className="text-base">Seat Configuration</Label>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-sm font-medium text-muted-foreground mb-2">
                  <span>Seat Type</span>
                  <span>Total Seats</span>
                  <span>Available</span>
                </div>
                
                {seatTypes.map((seat, idx) => (
                  <div
                    key={seat.seatType}
                    className="grid grid-cols-3 gap-2 items-center p-2 rounded-md border"
                  >
                    <span className="font-medium">{formatSeatType(seat.seatType)}</span>
                    <div className="relative">
                      <Hash className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground w-3 h-3" />
                      <Input
                        type="number"
                        value={seat.totalSeats}
                        onChange={(e) => handleSeatChange(idx, "totalSeats", e.target.value)}
                        className="pl-7 h-8"
                        min="0"
                      />
                    </div>
                    <div className="relative">
                      <User className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground w-3 h-3" />
                      <Input
                        type="number"
                        value={seat.availableSeats}
                        onChange={(e) => handleSeatChange(idx, "availableSeats", e.target.value)}
                        className="pl-7 h-8"
                        min="0"
                        max={seat.totalSeats}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button 
            onClick={handleSubmit} 
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Adding Coach...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Add Coach
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}