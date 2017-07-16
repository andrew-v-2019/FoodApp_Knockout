using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Data.Models;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.SpaServices.Webpack;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Services;
using Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Web
{
    public class Startup
    {
        public Startup(IHostingEnvironment env)
        {
            var builder = new ConfigurationBuilder()
                .SetBasePath(env.ContentRootPath)
                .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
                .AddJsonFile($"appsettings.{env.EnvironmentName}.json", optional: true)
                .AddEnvironmentVariables();
            Configuration = builder.Build();
        }

        public IConfigurationRoot Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddDbContext<Context>(options =>
                options.UseSqlServer(Configuration.GetConnectionString("DefaultConnection")));
            services.AddScoped<Services.IFileService, Services.FileService>();
            services.AddScoped<IMenuService, MenuService>();
            services.AddMvc();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            
            //loggerFactory.AddConsole(Configuration.GetSection("Logging"));
            //loggerFactory.AddDebug();
            Seed(app);
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseWebpackDevMiddleware(new WebpackDevMiddlewareOptions
                {
                    HotModuleReplacement = true
                });
            }
            else
            {
                app.UseExceptionHandler("/Home/Error");
            }

            app.UseStaticFiles();
            
            app.UseMvc(routes =>
            {
                routes.MapRoute(
                    name: "default",
                    template: "{controller=Home}/{action=Index}/{id?}");

                routes.MapSpaFallbackRoute(
                    name: "spa-fallback",
                    defaults: new { controller = "Home", action = "Index" });
            });
        }

        public static void Seed(IApplicationBuilder app)
        {
            using (var context = app.ApplicationServices.GetRequiredService<Context>())
            {
                context.Database.Migrate();
                var menuSections = new List<MenuSection>
                {
                    new MenuSection() {Name = "Салаты", Number = 1},
                    new MenuSection() {Name = "Супы", Number = 2},
                    new MenuSection() {Name = "Горячее ", Number = 3},
                    new MenuSection() {Name = "Гарнир", Number = 4},
                    new MenuSection() {Name = "Напитки", Number = 5}
                };
                foreach (var s in menuSections)
                {
                    if (!context.MenuSections.Any(x => x.Name.Equals(s.Name)))
                    {
                        context.Add(s);
                    }
                }
                context.SaveChanges();
            }
        }
    }
}
