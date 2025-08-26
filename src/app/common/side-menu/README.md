## Side Menu Component Integration Guide

### Step 1: Clone the Repository or Check for Updates
- **If `Angular-Components` Repository hasn"t been cloned yet in your `/root` directory:** Clone the Repository to `/root` using the following command:
  ```bash 
    git clone http://172.16.20.148:3000/TAS/Angular-Components.git
  ```
#### or

- **If the repository is already cloned :** Check for Updates by following these substeps :
  - (a) Navigate to the existing Angular-Components repository folder :
    ```bash
      cd /root/Angular-Components
    ```
  - (b) Fetch the latest changes from the remote repository by :
    ```bash
      git fetch --all
    ```
  - (c) Check if your local repository is up to date with the remote branch (e.g., main) :
    ```bash
      git status
    ```
  - (d) If you don"t see a message like: *Your branch is up to date with "origin/main"* your local repository is behind the remote, you can pull the latest changes using :
    ```bash
      git pull origin main
    ```
- If there are any conflicts, Git will prompt you to resolve them manually.


### Step 2: Required Packages/Files 
- a) **copy `side-menu` folder** from `/root/Angular-Components/` to **app folder** of working Angular project.
- b) **copy `shared` folder** from `/root/Angular-Components/` to **app folder** of working Angular project.
- c) **copy `ag-grid` folder** from `/root/Angular-Components/` to **app folder** and complete all the 5 STEPS from `apps/ag-grid/README.md`.
- d) Import { provideHttpClient } from "@angular/common/http"; in src/app/app.config.ts and add provideHttpClient() in providers.

### Step 3: Side Menu Component Configurations:
- Import sideMenuConfig from Side Menu component and initialize the configuration like below

  ```json 
  "LeftMenuConfig": "sideMenuConfig"  = {
    "type": 5,
    "list": ["Condition" ,"tasAlert"],
    "selectedItem": {},
    "tabList":["Condition" ,"tasAlert"],
    "displayKey": "",
    "selectedTab" : "Condition",
    "title": "Config",
    "iconClass": "fa fa-solid fa-cog",
    "width": "340px",
    "minWidth": "80px",
    "tabData":{
      "Condition":{"list":["AB","BC"]}
    },
    "visible": true,
    "buttonList": [
      [
        "primary",
        "Add New Project",
        "() => this.add_new_project(),"
        "fa fa-solid fa-plus",
      ]
    ],
    "centerClose": false,
    "upload": { 
      "hidden": false,
      "folder": "/var/www/html/docReview/",
      "whileupload":{
        "Condition" : false,
        "tasAlert" : ["", "error",2000]
      }
    },
    "uploadCb" : "(filename: string, hostname: any) => this.afterUploadCall(filename, "", hostname)",
    "itemSelectionCb": "(item: any) => this.sideMenuSelection(item)",
  }
  ```