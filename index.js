document.addEventListener("DOMContentLoaded", function () {
  // Mobile Menu Toggle
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  const mobileMenu = document.getElementById("mobileMenu");

  mobileMenuBtn.addEventListener("click", function () {
    mobileMenu.classList.toggle("hidden");
  });

  // CV Upload Functionality
  const cvUpload = document.getElementById("cvUpload");
  const uploadPrompt = document.getElementById("uploadPrompt");
  const uploadedFile = document.getElementById("uploadedFile");
  const fileName = document.getElementById("fileName");
  const fileSize = document.getElementById("fileSize");
  const downloadCv = document.getElementById("downloadCv");
  const removeCv = document.getElementById("removeCv");

  // Check for saved CV on page load
  const savedCV = localStorage.getItem("portfolioCV");
  if (savedCV) {
    const cvData = JSON.parse(savedCV);
    displayCV(cvData.name, cvData.size, cvData.url);
  }

  // Handle file upload
  cvUpload.addEventListener("change", function (e) {
    if (this.files && this.files[0]) {
      const file = this.files[0];

      // Check file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size exceeds 5MB limit");
        return;
      }

      const reader = new FileReader();
      reader.onload = function (e) {
        const cvData = {
          name: file.name,
          size: file.size,
          url: e.target.result,
          data: e.target.result.split(",")[1] // Store base64 data
        };

        // Save to localStorage
        localStorage.setItem("portfolioCV", JSON.stringify(cvData));

        // Display the CV
        displayCV(file.name, file.size, URL.createObjectURL(file));
      };
      reader.readAsDataURL(file);
    }
  });

  // Handle download
  downloadCv.addEventListener("click", function () {
    const savedCV = localStorage.getItem("portfolioCV");
    if (savedCV) {
      const cvData = JSON.parse(savedCV);
      const byteCharacters = atob(cvData.data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "application/octet-stream" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = cvData.name || "download";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  });

  // Handle remove
  removeCv.addEventListener("click", function () {
    localStorage.removeItem("portfolioCV");
    uploadPrompt.classList.remove("hidden");
    uploadedFile.classList.add("hidden");
    cvUpload.value = "";
  });

  // Helper function to display CV
  function displayCV(name, size, url) {
    fileName.textContent = name;
    fileSize.textContent = `${(size / (1024 * 1024)).toFixed(2)} MB`;
    uploadPrompt.classList.add("hidden");
    uploadedFile.classList.remove("hidden");
  }

  // Project Modal
  const addProjectBtn = document.getElementById("addProjectBtn");
  const projectModal = document.getElementById("projectModal");
  const closeModal = document.getElementById("closeModal");
  const cancelProject = document.getElementById("cancelProject");
  const projectForm = document.getElementById("projectForm");
  const projectImage = document.getElementById("projectImage");
  const imagePreview = document.getElementById("imagePreview");
  const imagePreviewContainer = document.getElementById(
    "imagePreviewContainer"
  );
  const removeImage = document.getElementById("removeImage");
  const projectsGrid = document.getElementById("projectsGrid");

  addProjectBtn.addEventListener("click", function () {
    projectModal.classList.remove("hidden");
  });

  closeModal.addEventListener("click", function () {
    projectModal.classList.add("hidden");
    projectForm.reset();
    imagePreviewContainer.classList.add("hidden");
  });

  cancelProject.addEventListener("click", function () {
    projectModal.classList.add("hidden");
    projectForm.reset();
    imagePreviewContainer.classList.add("hidden");
  });

  projectImage.addEventListener("change", function () {
    if (this.files && this.files[0]) {
      const file = this.files[0];
      const fileSize = file.size / 1024 / 1024; // in MB

      if (fileSize > 5) {
        alert("Image size exceeds 5MB");
        return;
      }

      const reader = new FileReader();

      reader.onload = function (e) {
        imagePreview.src = e.target.result;
        imagePreviewContainer.classList.remove("hidden");
      };

      reader.readAsDataURL(file);
    }
  });

  removeImage.addEventListener("click", function () {
    projectImage.value = "";
    imagePreviewContainer.classList.add("hidden");
  });

  // Project Form Submission
  // Replace the existing projectForm event listener with this:
  projectForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const title = document.getElementById("projectTitle").value;
    const category = document.getElementById("projectCategory").value;
    const description = document.getElementById("projectDescription").value;
    const link = document.getElementById("projectLink").value;
    const imageFile = projectImage.files[0];
    const isEdit = this.hasAttribute("data-edit-id");
    const editId = this.getAttribute("data-edit-id");

    // Create project object
    const project = { title, category, description, link };

    // Get existing projects
    let projects = JSON.parse(localStorage.getItem("portfolioProjects")) || [];

    // Handle image if uploaded
    const handleImageAndSave = (imageData) => {
      if (imageData) {
        project.image = imageData;
      } else if (isEdit && projects[editId]?.image) {
        // Keep existing image if not uploading a new one during edit
        project.image = projects[editId].image;
      }

      if (isEdit) {
        // Update existing project
        projects[editId] = project;
      } else {
        // Add new project
        projects.push(project);
      }

      // Save back to localStorage
      localStorage.setItem("portfolioProjects", JSON.stringify(projects));

      // Refresh the projects display
      loadProjects();

      // Close modal and reset form
      projectModal.classList.add("hidden");
      projectForm.reset();
      imagePreviewContainer.classList.add("hidden");
      projectForm.removeAttribute("data-edit-id");
    };

    if (imageFile) {
      const reader = new FileReader();
      reader.onload = function (e) {
        handleImageAndSave(e.target.result);
      };
      reader.readAsDataURL(imageFile);
    } else {
      handleImageAndSave(null);
    }
  });

  // Project Filter
  const projectFilters = document.querySelectorAll(".project-filter");

  projectFilters.forEach((filter) => {
    filter.addEventListener("click", function () {
      // Remove active class from all filters
      projectFilters.forEach((f) =>
        f.classList.remove("active", "bg-primary", "text-white")
      );
      // Add active class to clicked filter
      this.classList.add("active", "bg-primary", "text-white");

      const filterValue = this.getAttribute("data-filter");
      const projectCards = document.querySelectorAll(".project-card");

      projectCards.forEach((card) => {
        if (filterValue === "all" || card.classList.contains(filterValue)) {
          card.style.display = "block";
        } else {
          card.style.display = "none";
        }
      });
    });
  });

  // Contact Form
  const contactForm = document.getElementById("contactForm");

  contactForm.addEventListener("submit", function (e) {
    e.preventDefault();

    // Here you would typically send the form data to a server
    alert("Thank you for your message! I will get back to you soon.");
    contactForm.reset();
  });

  // Function to load projects from localStorage
  function loadProjects() {
    const projects =
      JSON.parse(localStorage.getItem("portfolioProjects")) || [];
    const grid = document.getElementById("projectsGrid");

    grid.innerHTML = "";

    projects.forEach((project) => {
      const projectCard = document.createElement("div");
      projectCard.className = `project-card bg-white rounded-lg overflow-hidden shadow-md transition-all duration-300 ${project.category}`;

      projectCard.innerHTML = `
        <div class="h-48 overflow-hidden">
            <img src="${
              project.image || "https://via.placeholder.com/400x225"
            }" 
                alt="${project.title}" 
                class="w-full h-full object-cover">
        </div>
        <div class="p-6">
            <div class="flex justify-between items-start mb-2">
                <h3 class="text-xl font-bold">${project.title}</h3>
                <span class="px-2 py-1 text-xs rounded-full ${getCategoryClass(
                  project.category
                )}">
                    ${
                      project.category.charAt(0).toUpperCase() +
                      project.category.slice(1)
                    }
                </span>
            </div>
            <p class="text-gray-600 mb-4">${project.description}</p>
            ${
              project.link
                ? `<a href="${project.link}" target="_blank" class="text-primary hover:underline">View Project</a>`
                : ""
            }
            
            <div class="admin-only flex justify-end space-x-2 mt-4">
                <button class="edit-project px-3 py-1 bg-green-500 text-white rounded text-sm" 
                        data-id="${projects.indexOf(project)}">
                    <i class="fas fa-edit mr-1"></i> Edit
                </button>
                <button class="delete-project px-3 py-1 bg-red-500 text-white rounded text-sm" 
                        data-id="${projects.indexOf(project)}">
                    <i class="fas fa-trash-alt mr-1"></i> Delete
                </button>
            </div>
        </div>
    `;

      grid.appendChild(projectCard);
    });
  }

  // Helper function for category classes
  function getCategoryClass(category) {
    switch (category) {
      case "web":
        return "bg-blue-100 text-blue-800";
      case "mobile":
        return "bg-purple-100 text-purple-800";
      case "design":
        return "bg-pink-100 text-pink-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }

  // Function to add sample projects if none exist
  function addSampleProjects() {
    if (!localStorage.getItem("portfolioProjects")) {
      const sampleProjects = [
        {
          title: "E-commerce Website",
          category: "web",
          description:
            "A fully responsive e-commerce platform with product filtering and cart functionality.",
          link: "https://example.com/ecommerce",
          image:
            "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
        },
        {
          title: "Fitness Mobile App",
          category: "mobile",
          description:
            "A cross-platform mobile application for tracking workouts and nutrition.",
          link: "https://example.com/fitnessapp",
          image:
            "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
        },
        {
          title: "Brand Identity Design",
          category: "design",
          description:
            "Complete brand identity including logo, color palette, and typography for a startup.",
          image:
            "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
        }
      ];

      localStorage.setItem("portfolioProjects", JSON.stringify(sampleProjects));
      loadProjects();
    }
  }

  // Admin password (change this to something secure)
  const ADMIN_PASSWORD = "mysecret123";

  // Check admin status on page load
  if (localStorage.getItem("portfolioAdmin") === "true") {
    document.body.classList.add("admin-mode");
  }

  // Ctrl+Shift+L shortcut for admin
  document.addEventListener("keydown", function (e) {
    if (e.ctrlKey && e.shiftKey && e.key === "L") {
      if (document.body.classList.contains("admin-mode")) {
        localStorage.removeItem("portfolioAdmin");
        document.body.classList.remove("admin-mode");
        alert("Admin mode disabled");
      } else {
        const password = prompt("Enter admin password:");
        if (password === ADMIN_PASSWORD) {
          localStorage.setItem("portfolioAdmin", "true");
          document.body.classList.add("admin-mode");
          alert("Admin mode enabled");
        } else {
          alert("Incorrect password");
        }
      }
    }
  });

  // Load projects and sample data
  addSampleProjects();
  loadProjects();

  // Add this after loadProjects() call in the DOMContentLoaded event
  document.addEventListener("click", function (e) {
    // Handle edit project
    if (
      e.target.classList.contains("edit-project") ||
      e.target.closest(".edit-project")
    ) {
      const button = e.target.classList.contains("edit-project")
        ? e.target
        : e.target.closest(".edit-project");
      const projectId = button.getAttribute("data-id");
      editProject(projectId);
    }

    // Handle delete project
    if (
      e.target.classList.contains("delete-project") ||
      e.target.closest(".delete-project")
    ) {
      const button = e.target.classList.contains("delete-project")
        ? e.target
        : e.target.closest(".delete-project");
      const projectId = button.getAttribute("data-id");
      if (confirm("Are you sure you want to delete this project?")) {
        deleteProject(projectId);
      }
    }
  });

  function editProject(projectId) {
    const projects =
      JSON.parse(localStorage.getItem("portfolioProjects")) || [];
    const project = projects[projectId];

    if (!project) return;

    // Fill the form with project data
    document.getElementById("projectTitle").value = project.title;
    document.getElementById("projectCategory").value = project.category;
    document.getElementById("projectDescription").value = project.description;
    document.getElementById("projectLink").value = project.link || "";

    // Handle image if it exists
    if (project.image) {
      imagePreview.src = project.image;
      imagePreviewContainer.classList.remove("hidden");
    }

    // Update the modal title and show delete button
    document.getElementById("modalTitle").textContent = "Edit Project";
    document.getElementById("deleteProject").classList.remove("hidden");
    document.getElementById("saveButtonText").textContent = "Update Project";

    // Set a data attribute to track which project we're editing
    projectForm.setAttribute("data-edit-id", projectId);

    // Show the modal
    projectModal.classList.remove("hidden");
  }

  function deleteProject(projectId) {
    const projects =
      JSON.parse(localStorage.getItem("portfolioProjects")) || [];
    projects.splice(projectId, 1);
    localStorage.setItem("portfolioProjects", JSON.stringify(projects));
    loadProjects();
  }

  // Add this event listener for the modal delete button
  document
    .getElementById("deleteProject")
    .addEventListener("click", function () {
      const editId = projectForm.getAttribute("data-edit-id");
      if (
        editId !== null &&
        confirm("Are you sure you want to delete this project?")
      ) {
        deleteProject(editId);
        projectModal.classList.add("hidden");
        projectForm.reset();
        imagePreviewContainer.classList.add("hidden");
        projectForm.removeAttribute("data-edit-id");
      }
    });

  addProjectBtn.addEventListener("click", function () {
    // Reset form and set to "add" mode
    projectForm.reset();
    projectForm.removeAttribute("data-edit-id");
    imagePreviewContainer.classList.add("hidden");
    document.getElementById("modalTitle").textContent = "Add New Project";
    document.getElementById("deleteProject").classList.add("hidden");
    document.getElementById("saveButtonText").textContent = "Save Project";
    projectModal.classList.remove("hidden");
  });
});
