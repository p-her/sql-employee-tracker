
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
                viewAllDepartment();
                
            }else if( answer.option === 'View All Roles'){
                viewAllRoles();
             
            }else if(answer.option === 'View All Employees'){
                viewAllEmployees();
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
               
               
            }


            startDBConnection();
        })

       
}

promptQuestion()


viewAllDepartment = () => {
 
    const sql = `SELECT id, name FROM department ORDER BY name ASC`;
    db.query(sql, (err, row) => {
        if(err){
            console.log(err)
            return;
        }
        console.table(row);
        return promptQuestion()
       
    })
}


function viewAllEmployees () {
    const sql = `
    SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name as department, role.salary 
    FROM department
    RIGHT JOIN role ON role.department_id = department.id
    RIGHT JOIN employee ON role_id = role.id
    ORDER BY employee.id ASC;`;

    
    
    db.query(sql, (err, row) => {
        if(err){
            console.log(err);
            return;
        }
        
        console.table(row);
        return promptQuestion();
        
    })

   
}

function viewAllRoles() {
    const sql = `
    SELECT role.id, role.title, department.name as department, role.salary
    FROM department
    RIGHT JOIN role ON department.id = department_id;
                `;
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
    
      const depArr = []
      if(err) {
          console.log(err);
      }
      for(let i = 0; i < row.length; i++){
          depArr[i] = row[i].name;
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
            choices: depArr
            
        }
    ]).then(answer => {

        console.log(answer.department)
        console.log(typeof(answer.department))
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



function startDBConnection (){

    db.connect(err => {
        if (err) throw err;
       
       
      });
}


