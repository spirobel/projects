class Tarjan
  def initialize
    @index = 0
    @stack = []
    @tasks = []
    @sccs = []
    ProjectsTask.ids.each {|t|
      if @tasks[t][:index].nil?
        strongconnect(t)
      end
    }
  end
  def strongconnect(t)
    @tasks[t]={index: @index, lowlink: @index, onStack: true}
    @index += 1
    @stack << t
    ProjectsTask.first(t).dependees.each {|d|
      if @tasks[d][:index].nil?
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
        break if x == t
      end
      @sccs << scc
    end
end
