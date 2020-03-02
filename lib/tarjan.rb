class Tarjan
  attr_accessor :sccs
  def initialize
    @index = 0
    @stack = []
    @tasks = []
    self.sccs = []
    ProjectsTask.ids.each {|t|
      if @tasks[t].nil?
        strongconnect(t)
      end
    }
  end
  def strongconnect(t)
    @tasks[t]={index: @index, lowlink: @index, onStack: true}
    @index += 1
    @stack << t
    ProjectsTask.where(["id = ?",t]).first.dependees.ids.each {|d|
      if @tasks[d].nil?
        strongconnect(d)
        @tasks[t][:lowlink] =[@tasks[t][:lowlink],@tasks[d][:lowlink]].min
      elsif @tasks[d][:onStack]
        @tasks[t][:lowlink] = [@tasks[t][:lowlink],@tasks[d][:index]].min
      end
    }
    if @tasks[t][:lowlink] == @tasks[t][:index]
      scc = []
      loop do
        x = @stack.pop
        @tasks[x][:onStack] = false
        scc << x 
        break if x == t
      end
      self.sccs << scc
    end
  end
end
