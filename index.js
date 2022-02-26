
const inquirer = require('inquirer');
const ctable = require('console.table');
const db = require('./db/connection');

const question = 'What would you like to do?';
const options = ['View All Employees', 'Add Employee', 'Update Employee Role', 'View All Roles','Add Role','View All Departments', 'Add Department']

async function promptQuestion() {
    return inquirer
        .prompt({
            type: 'list',
            name: 'option',
            message: question,
            choices: options
        })  
        .then(answer => {
            if(answer.option === 'View All Departments'){
                const sql = `SELECT id, name FROM department ORDER BY name ASC`;
                viewTable(sql);
            }else if( answer.option === 'View All Roles'){
                const sql = `SELECT role.id, role.title, department.name as department, role.salary
                FROM department
                RIGHT JOIN role ON department.id = department_id; `;
                viewTable(sql);
            }else if(answer.option === 'View All Employees'){
                const sql = ` SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name as department, role.salary 
                FROM department
                RIGHT JOIN role ON role.department_id = department.id
                RIGHT JOIN employee ON role_id = role.id
                ORDER BY employee.id ASC;`;
                viewTable(sql);
            }else if(answer.option === 'Add Department'){
                 inquirer
                    .prompt({
                    type:'input',
                    name: 'department',
                    message: 'What is the name of the department?',
                    validate: departmnetInput => {
                        if(departmnetInput){
                            return true;
                        }else{
                            return false;
                        }
                    }
                    })
                    .then(answer => {
                        addDepartment(answer.department);
                    })
            }else if(answer.option === 'Add Role'){
                addRole();
            }else if(answer.option === 'Add Employee'){
                getEmployeeInfo();
            }
            startDBConnection();
        })
}

function viewTable(query){
    const sql = query;
    db.query(sql, (err, row) => {
        if(err){
            console.log(err);
            return;
        }
        console.table(row);
        return promptQuestion();
    })
}

function addDepartment(departmentName) {
    const sql = `INSERT INTO department (name) VALUES (?)`;
    db.query(sql, departmentName, (err, row) => {
        if(err){
            console.log(err);
            return;
        }
        return promptQuestion();
    })
}

function addRole() {
  const sql = `SELECT name FROM department`;
  db.query(sql, (err, row) => {
    
      const departmentArr = []
      if(err) {
          console.log(err);
      }
      for(let i = 0; i < row.length; i++){
          departmentArr[i] = row[i].name;
      }
     
      inquirer
        .prompt([
        {
            type:'input',
            name: 'role',
            message: 'What is the name of the role?',
            validate: roleInput => {
                if(roleInput){
                    return true;
                }else{
                    return false;
                }
            }
        },
        {
            type:'input',
            name: 'salary',
            message: 'What is the salary of the role?',
            validate: salaryInput => {
                if(salaryInput){
                    return true;
                }else{
                    return false;
                }
            }
        },
        {
            type: 'list',
            name: 'department',
            message: 'Which department does the role belong to?',
            choices: departmentArr
        }
    ]).then(answer => {

   
        const sql1 = "SELECT id FROM department WHERE name = ?" ;
        db.query(sql1,answer.department, (err, row) => {
            if(err){
                console.log(err);
                return;
            }
            insertRole(answer.role, answer.salary, row[0].id);
        }) 
    })
 
  })
}

function insertRole(title, salary, department_id){
    const sql = `INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)`;
    db.query(sql, [title, salary, department_id], (err, row) =>{
        if(err){
            console.log(err);
            return;
        }
        return promptQuestion();
    })
}

function getEmployeeInfo(){
    const sql = "SELECT title FROM role; SELECT  first_name, last_name FROM employee ";

    db.query(sql,[1,2], (err, row) => {
       const roleArr = [], 
             managerArr = [];
        if(err){
            console.log(err);
            return ;
        }
     
        for(let i = 0; i < row[0].length; i++){
            roleArr[i] = row[0][i].title;
        }

        for(let j = 0; j < row[1].length; j++){
            managerArr[j] = row[1][j].first_name + " " + row[1][j].last_name ;
        }
        // console.log(roleArr)
        // console.log(managerArr)
        addEmployee(roleArr, managerArr);
    
    })
}

async function addEmployee(roleArray, managerArray){
    return inquirer
        .prompt([
            {
                type: 'input',
                name: 'firstNameInput',
                message: "What is the employee's first name?"   
            },
            {
                type: 'input',
                name: 'lastNameInput',
                message: "What is the employee's last name?"   
            },
            {
                type: 'list',
                name: 'roleInput',
                message: "What is the employee's role?",
                choices: roleArray
            },
            {
                type: 'list',
                name: 'managerInput',
                message: "Who is the employee's manager",
                choices: managerArray   
            }                
        ])
        .then(answer => {

           const sql = "SELECT id FROM role WHERE title = ? " ;
            // const sql = `SELECT id FROM role WHERE title = ? ,${answer.roleInput}; SELECT id FROM employee WHERE first_name = ? and last_name = ?, ${answer.firstNameInput, answer.lastNameInput}` ;
            

            const sql2 = "SELECT  id FROM employee WHERE concat(first_name, ' ',last_name) = ? " ;
         
        
            const firstName = answer.firstNameInput;
            const lastName = answer.lastNameInput;
            const roleName = answer.roleInput;
            const managerName = answer.managerInput;

            db.query(sql,roleName , (err, row) => {

              

                if(err){
                    console.log(err)
                    return;
                }

             

                const roleId = row[0].id;

                db.query(sql2, managerName, (err, row2) =>{
                    if(err){
                        console.log(err);
                        return;
                    }
         
                    const managerId = row2[0].id;
                 
                
                    insertEmployeeTable(firstName, lastName, roleId, managerId);
                })
                
            })
    

            promptQuestion();
        })
}




function insertEmployeeTable(firstName, lastName, roldId, managerId){
    const sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)`;
    db.query(sql, [firstName, lastName, roldId, managerId], (err, row) => {
        if(err){
            console.log(err);
            return ;
        }
    })
}



// start the application
  promptQuestion()

function startDBConnection (){
    db.connect(err => {
        if (err) throw err;
      });
}


