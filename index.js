
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
                ORDER BY employee.id ASC`;
                viewTable(sql) ;

                // viewAllEmployee();
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
            }else if(answer.option === 'Update Employee Role'){
                const sql = `SELECT first_name, last_name FROM employee`;
                db.query(sql, (err, row) => {
                    const employeeArr = [];
                    if(err){
                        console.log(err);
                        return;
                    }
            
                    for( let i = 0; i < row.length; i++){
                        employeeArr[i] = row[i].first_name + ' ' + row[i].last_name;
                    }
                    inquirer.prompt({
                        type: 'list',
                        name: 'nameInput',
                        message: "Which employee's role do you want to update?",
                        choices: employeeArr
                    }).then(employee => {
                        const sql = `SELECT title FROM role`;
                        db.query(sql, (err, row) => {
                            if(err){
                                console.log(err);
                                return ;
                            }
                            const roleArr = [];
                    
                            for( let i = 0; i < row.length; i++){
                                roleArr[i] = row[i].title;
                            }
                            inquirer.prompt({
                                type: 'list',
                                name: 'roleInput',
                                message: 'Which role do you want to assign the selected employee?',
                                choices: roleArr
                            }).then(role => {
                                //STOP HERE TRY TO GET DEPARTMENT NAME USING DEPARTMENT_ID FROM ROLE TABLE
                          
                                const departmentIdQuery = `SELECT department.id FROM department  
                                                            RIGHT JOIN role ON  role.department_id = department.id WHERE role.title = ? ORDER BY department.name ASC`;

                                db.query(departmentIdQuery, role.roleInput, (err, row) => {
                                    
                                   
                                    const depId = row[0].id;
                                    const name = employee.nameInput;
                                    console.log("name " + name)
                                
                                    const sql = "SELECT  id FROM employee WHERE concat(first_name, ' ',last_name) = ? " ;
                                    db.query(sql,name, (err, row) =>{
                                        // console.log('role id: ' + row[0].id)
                                        const employeeId = row[0].id;
                                        const roleName = role.roleInput;


                                        console.log("depId " + depId)
                                        console.log("employeeId " + employeeId)
                                        console.log('roleName: ' + roleName)
                                    
                                        updateEmployeeRole( roleName,depId, employeeId)
                                        
                                      
                                      
                                    })

                                  
                        
                                })
                                // END HERE
                               

                                
                            })
                        })
                       
                    })
                })
             
            }
            startDBConnection();
        })
}


// department_id = department.id change name

function updateEmployeeRole( role, depId, empId){


                //   const sql = `UPDATE employee 
                //   INNER JOIN role ON employee.role_id = role.id
                //   SET title = ? WHERE employee.id = ?
                //  `;

                const sql = `UPDATE role 
                LEFT JOIN department ON department.id = role.department_id
                RIGHT JOIN employee ON employee.role_id = role.id
                SET role.title = ?, role.department_id = ? WHERE employee.id = ?
               `;

                
    db.query(sql,[role, depId, empId], (err, row) => {
        if(err){
            console.log(err);
            return;
        }

        promptQuestion()
    })
}

function updateDepartment( roleName){

    const idsql = `SELECT department.id FROM department
                    RIGHT JOIN role ON role.department_id = department.id
                    WHERE title = ?`;


    db.query(idsql, roleName, (err, row) => {
        if(err){
            console.log(err);
            return;
        }

        console.log("======: " + row[0].id)
        // console.log('department id '+ row[0].department_id)
      
    })
}

function updateEmployeeDepartment(roleId, roleName){
    
}

/*
function viewAllEmployee(){
    const sql1 = ` SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name as department, role.salary 
    FROM department
    RIGHT JOIN role ON role.department_id = department.id
    RIGHT JOIN employee ON role_id = role.id
    ORDER BY employee.id ASC`;

    const sql2 = `SELECT  concat(m.first_name , ' ', m.last_name )  as manager
    FROM employee e
    JOIN employee m
    ON e.id = m.manager_id`;

    const sql = `SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name as department, role.salary,concat(m.first_name , ' ', m.last_name )  as manager 
    FROM department, role, employee e
    JOIN employee m ON e.id = m.manager_id AND
    RIGHT JOIN role ON role.department_id = department.id
    RIGHT JOIN employee ON role_id = role.id
    ORDER BY employee.id ASC `;

    db.query(sql, (err, row) => {
        if(err){
            console.log(err);
            return;
        }

       console.table(row)
       
        
    })
}
*/
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

