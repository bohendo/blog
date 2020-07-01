import React, { useState } from "react";

import {
  IconButton,
  Typography,
} from "@material-ui/core";
import {
  Edit as EditIcon,
  AddCircle as AddIcon,
} from "@material-ui/icons";

import { AddMeal } from "./AddMeal";
import { ProfileEdit } from "./ProfileEdit";
import { FoodLog } from "./FoodLog";

import { store } from "../utils/cache";

export const FitnessTracker = (props: any) => {

  const [profile, setProfile] = useState(store.load("FitnessProfile"));
  const [dialog, setDialog] = useState(false);

  const handleEditProfile = (event: React.ChangeEvent<{ value: any, id: string }>) => {
    const newProfile = { ...profile, [event.target.id]: event.target.value };
    setProfile(newProfile);
  };

  const handleProfileSave = () => store.save("FitnessProfile", profile);
  const toggleProfileDialog = () => setDialog(!dialog);
  const toggleMealDialog = () => setDialog(!dialog);

  const today = new Date();

  console.log(profile);
  return (
    <>
      <Typography>
        Hello {profile.name || "Stranger"}!
        <IconButton onClick={toggleProfileDialog}>
          <EditIcon />
        </IconButton>
      </Typography>
      <ProfileEdit
        dialog={dialog}
        profile={profile}
        handleEditProfile={handleEditProfile}
        handleProfileSave={handleProfileSave}
        toggleProfileDialog={toggleProfileDialog}
      />
      <Typography> {today.toDateString()} </Typography>
      <FoodLog
        foodLog={profile.foodLog}
        handleProfileSave={handleProfileSave}
      />
      <IconButton onClick={toggleMealDialog}>
        <AddIcon />
      </IconButton>
      <AddMeal
        dialog={dialog}
        profile={profile}
        handleProfileSave={handleProfileSave}
        setProfile={setProfile}
        toggleMealDialog={toggleMealDialog}
      />
    </>
  );
};
