# Projects


This is a plugin to manage task dependencies with discourse.
It basically turns a category into a project and the topics in this category into tasks of this project.
You can define dependencies between tasks. Essentially which tasks need to finish before other tasks can begin. You can also define beginning dates, end dates and the task duration. It will automatically set the beginning and end dates of the dependent tasks if you change them somewhere.
It will also display earliest beginning date and latest end date in the category header.
The total project duration will also be computed. You can also lock tasks so that the automatic computation of beginning and end dates does not affect them.
This youtube video explains how to use it:
[![Watch the video](https://i.imgur.com/mZaFKkw.png)](https://www.youtube.com/embed/qWR-YZ_khjw)

TODO:
  * show messages on mobile / narrow screens
  * add a topic list view to show tasks in topological order (+indent the dependers a little)
  * use message bus to notify other users of changes
  * add revision capability for project tasks
  * add support for subprojects (one subproject will be a task in one project but also its own category)
  * make the UI more beautiful (links instead of buttons etc)
  * write tests

## Installation

Follow [Install a Plugin](https://meta.discourse.org/t/install-a-plugin/19157)
how-to from the official Discourse Meta, using `git clone https://github.com/spirobel/projects.git`
as the plugin command.

## Usage

## Feedback

If you have issues or suggestions for the plugin, please bring them up on
[Discourse Meta](https://meta.discourse.org/t/projects-management-plugin/143712).

## Poem
```
I depend on you.
You depend on me.
Who is the depender?
And who is the dependee?
```
