import React, { useState } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";
import axios from "axios";
import Swal from "sweetalert2";
import {
  Box,
  TextField,
  Button,
  Typography,
  Grid,
  IconButton,
  Card,
  CardContent,
} from "@mui/material";
import { Add, Remove } from "@mui/icons-material";

const AddResearch = () => {
  const [entries, setEntries] = useState([
    { title: "", keyword: "", year: "", pdf: null },
  ]);

  const handleFieldChange = (index, field, value) => {
    const updatedEntries = [...entries];
    updatedEntries[index][field] = value;
    setEntries(updatedEntries);
  };

  const handlePdfChange = (index, file) => {
    const updatedEntries = [...entries];
    updatedEntries[index].pdf = file;
    setEntries(updatedEntries);
  };

  const addEntry = () => {
    setEntries([...entries, { title: "", keyword: "", year: "", pdf: null }]);
  };

  const removeEntry = (index) => {
    const updatedEntries = entries.filter((_, i) => i !== index);
    setEntries(updatedEntries);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (entries.some((entry) => !entry.title || !entry.pdf || !entry.year)) {
      Swal.fire("Error!", "Please fill in all fields and upload PDFs.", "error");
      return;
    }

    Swal.fire({
      title: "Uploading...",
      text: "Please wait while the PDFs are being uploaded.",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const uploadedEntries = await Promise.all(
        entries.map(async (entry) => {
          const storageRef = ref(storage, `Abstract/${entry.pdf.name}`);
          const uploadTask = uploadBytesResumable(storageRef, entry.pdf);

          await new Promise((resolve, reject) => {
            uploadTask.on(
              "state_changed",
              null,
              (error) => reject(error),
              () => resolve()
            );
          });

          const downloadURL = await getDownloadURL(storageRef);

          return {
            title: entry.title,
            keyword: entry.keyword,
            year: entry.year,
            url: downloadURL,
          };
        })
      );

      await axios.post("https://gs-backend-r39y.onrender.com/api/research/bulk", {
        researchList: uploadedEntries,
      });

      Swal.close();
      Swal.fire("Success!", "All research data uploaded successfully!", "success");
      setEntries([{ title: "", keyword: "", year: "", pdf: null }]);
    } catch (error) {
      console.error("Error uploading research data:", error);
      Swal.fire("Error!", "Error uploading research data.", "error");
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4" textAlign="center" mb={3}>
        Research Repository
      </Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          {entries.map((entry, index) => (
            <Grid item xs={12} key={index}>
              <Card>
                <CardContent>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        fullWidth
                        label="Title"
                        value={entry.title}
                        onChange={(e) =>
                          handleFieldChange(index, "title", e.target.value)
                        }
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        fullWidth
                        label="Keyword"
                        value={entry.keyword}
                        onChange={(e) =>
                          handleFieldChange(index, "keyword", e.target.value)
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Year Submitted"
                        value={entry.year}
                        onChange={(e) =>
                          handleFieldChange(index, "year", e.target.value)
                        }
                        inputProps={{ maxLength: 4 }}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Button
                        variant="outlined"
                        component="label"
                        fullWidth
                        required
                      >
                        Upload PDF
                        <input
                          type="file"
                          accept="application/pdf"
                          hidden
                          onChange={(e) =>
                            handlePdfChange(index, e.target.files[0])
                          }
                        />
                      </Button>
                      {entry.pdf && (
                        <Typography variant="body2">
                          Selected: {entry.pdf.name}
                        </Typography>
                      )}
                    </Grid>
                    {entries.length > 1 && (
                      <Grid item xs={12}>
                        <IconButton onClick={() => removeEntry(index)} color="error">
                          <Remove />
                        </IconButton>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
          <Grid item xs={12}>
            <Grid container justifyContent="space-between" alignItems="center">
              <Button
                type="submit"
                variant="contained"
                color="success"
                style={{ width: "200px" }}
              >
                Submit All
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<Add />}
                onClick={addEntry}
                style={{ width: "250px" }}
              >
                Add Another Research
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default AddResearch;
