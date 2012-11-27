import webapp2
import jinja2
from jinja2 import Template
import os
from google.appengine.ext import db
from google.appengine.api import users

class Machine(db.Model):
  created = db.DateTimeProperty(auto_now_add=True)
  updated = db.DateTimeProperty(auto_now=True)    
  name = db.StringProperty(required=False)
  author = db.StringProperty(required=False)
  email = db.StringProperty(required=False)
  description = db.TextProperty(required=False)
  code = db.TextProperty(required=False)
  tape = db.StringProperty(required=False)
  state = db.StringProperty(required=False)

jinja_environment = jinja2.Environment(
  loader=jinja2.FileSystemLoader(os.path.dirname(__file__)))

class MainHandler(webapp2.RequestHandler):
  def get(self):
    template = jinja_environment.get_template('templates/MaquinaTuring.html')
    self.response.out.write(template.render())

def GetUserMachine(email):
  allMachines = db.GqlQuery("SELECT * "
                            "FROM Machine "
                            "WHERE email = :1",
                            email)
  for m in allMachines.run(limit=1):
    return m
  return None

class SaveMachine(webapp2.RequestHandler):
  def post(self):
    user = users.get_current_user()
    if not user:
      self.redirect(users.create_login_url(self.request.uri))
      return;

    newMachine = GetUserMachine(user.email())
    if not newMachine:
      newMachine = Machine(email = user.email())
    
    newMachine.name = self.request.get("name")
    newMachine.author = self.request.get("author")
    newMachine.description = self.request.get("description")
    newMachine.code = self.request.get("code")
    newMachine.tape = self.request.get("tape")
    newMachine.state = self.request.get("state")

    newMachine.put()
    self.response.out.write(newMachine.key().id())

class MachineList(webapp2.RequestHandler):
  def get(self):
    allMachines = db.GqlQuery("SELECT * "
                            "FROM Machine ")
    
    lineTemplate = Template('<a href="/machine?id={{machine_id}}"> {{author_name}}'
    	', {{machine_name}} </a> </br></br>')
    renderedMachines = ''.join(
      [lineTemplate.render(
        machine_id = m.key().id(),
        machine_name = m.name,
        author_name = m.author) for m in allMachines])

    template = jinja_environment.get_template('templates/machine_list.html')
    self.response.out.write(template.render(renderedMachines = renderedMachines))

def RenderViewer(handler, machine):
  template = jinja_environment.get_template('templates/machine_viewer.html')
  handler.response.out.write(template.render(
    name = machine.name,
    author = machine.author,
    code = machine.code,
    state = machine.state,
    tape = machine.tape,
    description = machine.description))

def RenderEditorEmpty():
  template = jinja_environment.get_template('templates/machine_editor.html')
  return template.render(
    name = "",
    author = "",
    code = "",
    state = "",
    tape = "",
    description = "")

def RenderEditor(machine):
  template = jinja_environment.get_template('templates/machine_editor.html')
  return template.render(
    name = machine.name,
    author = machine.author,
    code = machine.code,
    state = machine.state,
    tape = machine.tape,
    description = machine.description)

class MachineEditor(webapp2.RequestHandler):
  def get(self):
    user = users.get_current_user()
    if not user:
      self.redirect(users.create_login_url(self.request.uri))
      return;

    machine_id = self.request.get('id')
    if not machine_id: 
      m = GetUserMachine(user.email())
      if m:
        self.response.out.write(RenderEditor(m))
      else:
        self.response.out.write(RenderEditorEmpty())
      return

    m = Machine.get_by_id(int(machine_id))
    if not m:
      self.response.out.write("maquina de id =="+machine_id+" nao existe.")
      return

    if m.email != user.email():
      self.response.out.write(RenderViewer(self, m))
      return;

    self.response.out.write(RenderEditor(m))

  
app = webapp2.WSGIApplication([
  ('/', MachineList),
  ('/savemachine', SaveMachine),
  ('/machine', MachineEditor)
], debug=True)
